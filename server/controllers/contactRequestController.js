import ContactRequest from '../models/ContactRequest.js';
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const createContactRequest = async (req, res, next) => {
  try {
    const { recipient, bloodRequest, message } = req.body;
    const senderId = req.user._id;

    // Rule: Prevent self-contact
    if (senderId.toString() === recipient.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot send a contact request to yourself.',
      });
    }

    // Verify recipient exists and is active
    const recipientUser = await User.findById(recipient);
    if (!recipientUser || recipientUser.status === 'suspended') {
      return res.status(404).json({
        success: false,
        message: 'Recipient user account does not exist or is suspended.',
      });
    }

    // If linked to a blood request, check its validity
    let linkedRequest = null;
    if (bloodRequest) {
      linkedRequest = await BloodRequest.findById(bloodRequest);
      if (!linkedRequest) {
        return res.status(404).json({
          success: false,
          message: 'The referenced blood request was not found.',
        });
      }
      if (linkedRequest.status !== 'open') {
        return res.status(400).json({
          success: false,
          message: `Cannot send offers to a blood request that is ${linkedRequest.status}.`,
        });
      }
    }

    // Rule: Prevent duplicate pending contact requests
    const existingPending = await ContactRequest.findOne({
      sender: senderId,
      recipient,
      bloodRequest: bloodRequest || null,
      status: 'pending',
    });

    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active pending contact request with this user for this request.',
      });
    }

    const newContact = new ContactRequest({
      sender: senderId,
      recipient,
      bloodRequest: bloodRequest || null,
      message: message.trim(),
      status: 'pending',
    });

    await newContact.save();

    // Trigger Notification for the recipient
    const notificationTitle = linkedRequest
      ? `New Donation Offer for ${linkedRequest.bloodGroup} Blood Request`
      : `New Direct Donor Contact Request from ${req.user.name}`;

    const notificationMsg = linkedRequest
      ? `${req.user.name} offered to help with your request at ${linkedRequest.hospitalName}.`
      : `${req.user.name} reached out regarding potential blood donation.`;

    await Notification.create({
      user: recipient,
      title: notificationTitle,
      message: notificationMsg,
      type: 'contact_request_received',
      relatedEntityId: newContact._id,
      relatedEntityType: 'ContactRequest',
    });

    return res.status(201).json({
      success: true,
      message: 'Contact request sent successfully.',
      contactRequest: newContact,
    });
  } catch (error) {
    next(error);
  }
};

export const getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await ContactRequest.find({ recipient: req.user._id })
      .populate('sender', 'name email phone address.city address.state donorProfile')
      .populate('bloodRequest', 'bloodGroup unitsRequired hospitalName city state status urgency')
      .sort({ createdAt: -1 })
      .lean();

    // Enforce privacy: Only reveal private contact info (phone, email) if request is accepted!
    const sanitizedRequests = requests.map((reqItem) => {
      if (reqItem.status !== 'accepted' && reqItem.sender) {
        delete reqItem.sender.phone;
        delete reqItem.sender.email;
      }
      return reqItem;
    });

    return res.status(200).json({
      success: true,
      requests: sanitizedRequests,
    });
  } catch (error) {
    next(error);
  }
};

export const getOutgoingRequests = async (req, res, next) => {
  try {
    const requests = await ContactRequest.find({ sender: req.user._id })
      .populate('recipient', 'name email phone address.city address.state donorProfile')
      .populate('bloodRequest', 'bloodGroup unitsRequired hospitalName city state status urgency')
      .sort({ createdAt: -1 })
      .lean();

    // Enforce privacy: Only reveal recipient's private contact info (phone, email) if accepted!
    const sanitizedRequests = requests.map((reqItem) => {
      if (reqItem.status !== 'accepted' && reqItem.recipient) {
        delete reqItem.recipient.phone;
        delete reqItem.recipient.email;
      }
      return reqItem;
    });

    return res.status(200).json({
      success: true,
      requests: sanitizedRequests,
    });
  } catch (error) {
    next(error);
  }
};

export const respondToContactRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'

    const contact = await ContactRequest.findById(id)
      .populate('sender', 'name')
      .populate('recipient', 'name');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found.',
      });
    }

    // Only intended recipient can accept or reject
    if (contact.recipient._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the recipient can respond to this contact request.',
      });
    }

    if (contact.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This contact request is already ${contact.status}.`,
      });
    }

    const newStatus = action === 'accept' ? 'accepted' : 'rejected';
    contact.status = newStatus;
    await contact.save();

    // Notify the sender about the response
    const title = action === 'accept'
      ? `Contact Request Accepted by ${req.user.name}`
      : `Contact Request Declined`;

    const message = action === 'accept'
      ? `${req.user.name} accepted your contact request! Direct contact details are now unlocked in your inbox.`
      : `${req.user.name} was unable to accept your contact request at this time.`;

    await Notification.create({
      user: contact.sender._id,
      title,
      message,
      type: action === 'accept' ? 'contact_request_accepted' : 'contact_request_rejected',
      relatedEntityId: contact._id,
      relatedEntityType: 'ContactRequest',
    });

    return res.status(200).json({
      success: true,
      message: `Contact request ${newStatus} successfully.`,
      contactRequest: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelContactRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await ContactRequest.findById(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact request not found.',
      });
    }

    // Only sender can cancel
    if (contact.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own pending requests.',
      });
    }

    if (contact.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a request that is already ${contact.status}.`,
      });
    }

    contact.status = 'cancelled';
    await contact.save();

    return res.status(200).json({
      success: true,
      message: 'Contact request cancelled successfully.',
    });
  } catch (error) {
    next(error);
  }
};
