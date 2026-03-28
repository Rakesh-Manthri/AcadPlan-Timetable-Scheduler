// User.js - Defines how users are stored in database
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define what a User looks like
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,           // Must have a name
  },
  email: {
    type: String,
    required: true,
    unique: true,              // No two users can have same email
    lowercase: true,           // Convert email to lowercase automatically
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student'],  // Can only be one of these
    default: 'student',                     // Default role is student
  },
  department: String,                       // Optional field
  createdAt: {
    type: Date,
    default: Date.now,                      // Automatically set current date
  },
});

// Before saving a user, encrypt the password
UserSchema.pre('save', async function(next) {
  // If password hasn't changed, skip encryption
  if (!this.isModified('password')) return next();
  
  // Hash the password with 10 rounds of encryption
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to check if entered password matches stored password
UserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};
// Create the model from the schema
module.exports = mongoose.model('User', UserSchema);