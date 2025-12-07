require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Household = require('./src/models/Household');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const households = await Household.find().populate('members.user');
    console.log(`Found ${households.length} household(s)`);
    
    for (const household of households) {
      console.log(`\nProcessing household: ${household.name}`);
      
      for (const member of household.members) {
        if (!member.user) continue;
        
        const user = await User.findById(member.user._id || member.user);
        if (!user) continue;
        
        // Set user.role based on household member.role
        user.role = member.role || 'member';
        await user.save();
        
        console.log(`  ✅ ${user.name}: role = ${user.role}`);
      }
    }
    
    console.log('\n✅ All user roles updated!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });