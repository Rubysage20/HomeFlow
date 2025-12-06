require('dotenv').config();
const mongoose = require('mongoose');

console.log('Starting role update script...');
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

const Household = mongoose.model('Household', new mongoose.Schema({
  name: String,
  creator: mongoose.Schema.Types.ObjectId,
  members: [{
    user: mongoose.Schema.Types.ObjectId,
    role: String,
    joinedAt: Date
  }]
}));

console.log('Connecting to MongoDB...');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const households = await Household.find();
    console.log(`Found ${households.length} household(s)`);
    
    if (households.length === 0) {
      console.log('No households to update');
      process.exit(0);
    }
    
    for (const household of households) {
      console.log(`\nProcessing household: ${household.name || 'Unnamed'}`);
      console.log(`  Creator ID: ${household.creator || 'MISSING'}`);
      console.log(`  Members: ${household.members.length}`);
      
      // If no creator, use first member as admin
      if (!household.creator && household.members.length > 0) {
        household.creator = household.members[0].user;
        console.log(`  ⚠️  No creator found - setting first member as creator`);
      }
      
      let updated = false;
      
      for (let i = 0; i < household.members.length; i++) {
        const member = household.members[i];
        
        if (!member.user) {
          console.log(`  ⚠️  Member ${i} has no user ID - skipping`);
          continue;
        }
        
        const memberUserId = member.user.toString();
        const creatorId = household.creator ? household.creator.toString() : null;
        const isCreator = creatorId && memberUserId === creatorId;
        
        console.log(`  - Member ${memberUserId.substring(0, 8)}...: ${isCreator ? 'Creator' : 'Regular member'} (current role: ${member.role || 'none'})`);
        
        if (isCreator && member.role !== 'admin') {
          member.role = 'admin';
          updated = true;
          console.log(`    ✅ Set to admin`);
        } else if (!isCreator && member.role !== 'member') {
          member.role = 'member';
          updated = true;
          console.log(`    ✅ Set to member`);
        } else {
          console.log(`    ℹ️  Already has correct role`);
        }
      }
      
      if (updated) {
        await household.save();
        console.log(`  💾 Household saved`);
      } else {
        console.log(`  ℹ️  No changes needed`);
      }
    }
    
    console.log('\n✅ All households updated successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  });

// Timeout after 30 seconds
setTimeout(() => {
  console.error('❌ Script timed out after 30 seconds');
  process.exit(1);
}, 30000);