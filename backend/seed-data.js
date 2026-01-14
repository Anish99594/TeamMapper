// Script to add dummy data to the database
require('dotenv').config();
const UserTeamMapping = require('./models/UserTeamMapping');

const dummyMappings = [
  {
    teamMemberId: 'user001',
    teamLeadId: 'lead001',
    projectName: 'Broadcast',
    projectManagerId: 'pm001'
  },
  {
    teamMemberId: 'user002',
    teamLeadId: 'lead001',
    projectName: 'Broadcast',
    projectManagerId: 'pm001'
  },
  {
    teamMemberId: 'user003',
    teamLeadId: 'lead002',
    projectName: 'Clarity',
    projectManagerId: 'pm002'
  },
  {
    teamMemberId: 'user004',
    teamLeadId: 'lead002',
    projectName: 'Clarity',
    projectManagerId: 'pm002'
  },
  {
    teamMemberId: 'user005',
    teamLeadId: 'lead003',
    projectName: 'Broadcast',
    projectManagerId: 'pm001'
  },
  {
    teamMemberId: 'user006',
    teamLeadId: 'lead003',
    projectName: 'Echo',
    projectManagerId: 'pm003'
  },
  {
    teamMemberId: 'user007',
    teamLeadId: 'lead001',
    projectName: 'Echo',
    projectManagerId: 'pm003'
  },
  {
    teamMemberId: 'user008',
    teamLeadId: 'lead004',
    projectName: 'Clarity',
    projectManagerId: 'pm002'
  }
];

async function seedData() {
  console.log('Seeding dummy data...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (const mapping of dummyMappings) {
    try {
      // Check if mapping already exists
      const exists = await UserTeamMapping.exists(mapping.teamMemberId, mapping.projectName);
      if (exists) {
        console.log(`⚠ Skipped: ${mapping.teamMemberId} → ${mapping.projectName} (already exists)`);
        continue;
      }

      // Create the mapping
      await UserTeamMapping.create(mapping);
      console.log(`✓ Added: ${mapping.teamMemberId} → ${mapping.projectName}`);
      successCount++;
    } catch (error) {
      if (error.code === '23505') {
        console.log(`⚠ Skipped: ${mapping.teamMemberId} → ${mapping.projectName} (already exists)`);
      } else {
        console.error(`✗ Failed: ${mapping.teamMemberId} → ${mapping.projectName}`, error.message);
        errorCount++;
      }
    }
  }

  console.log(`\n✓ Seeding complete!`);
  console.log(`  Success: ${successCount}`);
  console.log(`  Skipped/Errors: ${errorCount}`);
  
  // Close database connection
  process.exit(0);
}

seedData().catch((error) => {
  console.error('Error seeding data:', error);
  process.exit(1);
});
