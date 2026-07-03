import mongoose, { Schema } from 'mongoose';

export interface INote {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  color: string;
  pinned: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: 'clay',
    },
    pinned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NoteSchema.index({ createdAt: -1 });

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
