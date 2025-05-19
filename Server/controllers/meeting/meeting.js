const MeetingHistory = require("../../model/schema/meeting");
const mongoose = require("mongoose");

const add = async (req, res) => {
  try {
    const meetingData = {
      ...req.body,
      createBy: req.user.userId,
    };
    const meeting = new MeetingHistory(meetingData);
    await meeting.save();
    res.status(200).json(meeting);
  } catch (err) {
    console.error("Failed to create Meeting:", err);
    res.status(400).json({ error: "Failed to create Meeting" });
  }
};

const index = async (req, res) => {
    try {
      // Base filter: not deleted
      const filter = { deleted: false };
      if (req.user.role !== 'superAdmin') {
        filter.createBy = new mongoose.Types.ObjectId(req.user.userId);
      }
  
      const meetings = await MeetingHistory.aggregate([
        { $match: filter },
        // join creator
        {
          $lookup: {
            from: 'User',
            localField: 'createBy',
            foreignField: '_id',
            as: 'creator'
          }
        },
        { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
        // join contact attendees
        {
          $lookup: {
            from: 'Contacts',
            localField: 'attendes',
            foreignField: '_id',
            as: 'attendeesContacts'
          }
        },
        // join lead attendees
        {
          $lookup: {
            from: 'Leads',
            localField: 'attendesLead',
            foreignField: '_id',
            as: 'attendeesLeads'
          }
        },
        // reshape fields: embed creator as createBy, and attendee arrays
        {
          $addFields: {
            createBy: {
              _id: '$creator._id',
              username: '$creator.username',
              firstName: '$creator.firstName',
              lastName: '$creator.lastName',
              role: '$creator.role'
            },
            attendes: '$attendeesContacts',
            attendesLead: '$attendeesLeads'
          }
        },
        // remove intermediate and sensitive fields
        {
          $project: {
            creator: 0,
            attendeesContacts: 0,
            attendeesLeads: 0,
            deleted: 0
          }
        }
      ]);
  
      return res.status(200).json({ success: true, data: meetings });
    } catch (err) {
      console.error('Meeting.index error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  };

  const view = async (req, res) => {
    try {
      const meetingId = new mongoose.Types.ObjectId(req.params.id);
      const filter = { _id: meetingId, deleted: false };
      if (req.user.role !== 'superAdmin') {
        filter.createBy = new mongoose.Types.ObjectId(req.user.userId);
      }
  
      const result = await MeetingHistory.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: 'User',
            localField: 'createBy',
            foreignField: '_id',
            as: 'creator'
          }
        },
        { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'Contacts',
            localField: 'attendes',
            foreignField: '_id',
            as: 'attendeesContacts'
          }
        },
        {
          $lookup: {
            from: 'Leads',
            localField: 'attendesLead',
            foreignField: '_id',
            as: 'attendeesLeads'
          }
        },
        {
          $addFields: {
            createBy: {
              _id: '$creator._id',
              username: '$creator.username',
              firstName: '$creator.firstName',
              lastName: '$creator.lastName',
              role: '$creator.role'
            },
            attendes: '$attendeesContacts',
            attendesLead: '$attendeesLeads'
          }
        },
        {
          $project: {
            creator: 0,
            attendeesContacts: 0,
            attendeesLeads: 0,
            deleted: 0
          }
        }
      ]);
  
      if (!result.length) {
        return res.status(404).json({ success: false, message: 'No Data Found.' });
      }
  
      return res.status(200).json({ success: true, data: result[0] });
    } catch (err) {
      console.error('Meeting.view error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  };

const deleteData = async (req, res) => {
  try {
    const meeting = await MeetingHistory.findOne({ _id: req.params.id });
    if (!meeting || meeting.deleted) {
      return res.status(404).json({ message: "No Data Found." });
    }
    if (
      req.user.role !== "superAdmin" &&
      meeting.createBy.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    meeting.deleted = true;
    await meeting.save();
    res.status(200).json({ message: "Deleted", meeting });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

const deleteMany = async (req, res) => {
  try {
    let filter = { _id: { $in: req.body } };
    if (req.user.role !== "superAdmin") {
      filter.createBy = req.user.userId;
    }
    const result = await MeetingHistory.updateMany(filter, {
      $set: { deleted: true },
    });
    res.status(200).json({ message: "Deleted", count: result.modifiedCount });
  } catch (err) {
    res.status(404).json({ message: "error", err });
  }
};

module.exports = { add, index, view, deleteData, deleteMany };
