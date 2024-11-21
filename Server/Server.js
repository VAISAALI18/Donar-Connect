const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// Create the Express app
const app = express();
const PORT = process.env.PORT || 5014;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const mongoUri = 'mongodb://localhost:27017/your_database_name'; // Replace with your actual database URI

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Define Mongoose schemas and models
const registerBloodSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  phone: String,
  age: Number,
  gender: String,
  type: String,
  bloodType: String,
  units: Number,
  place: String,
});

const RegisterBlood = mongoose.model('RegisterBlood', registerBloodSchema);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const Register = mongoose.model('Register', userSchema);

const donationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  bloodType: { type: String, required: true },
  units: { type: Number, required: true, default: 1 },
  alreadyRegistered: { type: String, required: true },
  place: { type: String, required: true },
});

const Donation = mongoose.model('Donation', donationSchema);

// Route for handling user registration
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the email is already registered
    const existingRegistration = await Register.findOne({ email });
    if (existingRegistration) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new registration entry
    const newRegistration = new Register({ email, password: hashedPassword });
    await newRegistration.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Error saving registration data:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Route for handling user login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await Register.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Route for handling donation form submission
app.post('/api/donate', async (req, res) => {
  try {
    const newDonation = new Donation(req.body);
    await newDonation.save();
    res.status(201).json({ message: 'Donation data saved successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving donation data', error });
  }
});

// Route for handling registration form submission
app.post('/api/register', async (req, res) => {
  const { name, email, phone, age, gender, type, bloodType, units, place } = req.body;

  // Validation (simple example)
  if (!email.includes('@')) {
    return res.status(400).json({ message: 'Invalid email' });
  }
  if (phone.length !== 10) {
    return res.status(400).json({ message: 'Phone number must be 10 digits' });
  }

  try {
    // Create a new record
    const bloodRegister = new RegisterBlood({
      name,
      email,
      phone,
      age,
      gender,
      type,
      bloodType,
      units,
      place,
    });

    // Save to the database
    await bloodRegister.save();

    // Respond to the frontend
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error saving user to the database:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to search donations by pincode and blood type
app.get('/api/search', async (req, res) => {
  const { pincode, bloodType } = req.query;

  try {
    // Search for matching donations
    const donations = await Donation.find({
      place: pincode,
      bloodType: bloodType,
    });

    if (donations.length > 0) {
      // Map the donations to return only the necessary fields
      const results = donations.map((donation) => ({
        name: donation.name,
        bloodType: donation.bloodType,
        units: donation.units,
        phone: donation.phone,
        
      }));

      res.status(200).json(results);
    } else {
      res.status(404).json({ message: 'No matching donations found' });
    }
  } catch (error) {
    console.error('Error fetching donations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
