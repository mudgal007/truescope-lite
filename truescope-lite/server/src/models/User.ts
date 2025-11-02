import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'reviewer', 'admin'], default: 'user' }
}, {
    timestamps: true
});

export const User = mongoose.model('User', UserSchema);