import { ref, get, set, push, update } from 'firebase/database';
import { database } from '../firebase/config';

// ============================================
// TYPES
// ============================================

interface MigrationResult {
  success: boolean;
  familiesCreated: number;
  childrenMigrated: number;
  errors: string[];
  familyDetails: {
    familyId: string;
    familyName: string;
    parentName: string;
    childrenCount: number;
  }[];
}

// ============================================
// MIGRATION SCRIPT
// ============================================

export async function migrateChildrenToFamilies(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: false,
    familiesCreated: 0,
    childrenMigrated: 0,
    errors: [],
    familyDetails: []
  };

  try {
    console.log('🔄 Starting Family Migration...');
    console.log('=====================================');

    // ============================================
    // Step 1: Get all children
    // ============================================
    console.log('📚 Step 1: Fetching all children...');
    const childrenRef = ref(database, 'children');
    const childrenSnapshot = await get(childrenRef);
    
    if (!childrenSnapshot.exists()) {
      result.errors.push('No children found in database');
      console.log('❌ No children found');
      return result;
    }
    
    const children = childrenSnapshot.val();
    const childrenCount = Object.keys(children).length;
    console.log(`✅ Found ${childrenCount} children`);

    // ============================================
    // Step 2: Group children by parentId
    // ============================================
    console.log('👥 Step 2: Grouping children by parent...');
    const familyGroups: { [key: string]: any[] } = {};
    
    Object.keys(children).forEach(childId => {
      const child = { id: childId, ...children[childId] };
      
      // Skip inactive children
      if (child.isActive === false) {
        console.log(`⏭️  Skipping inactive child: ${child.name}`);
        return;
      }
      
      const parentId = child.parentId;
      
      if (!parentId) {
        result.errors.push(`Child ${child.name} (${childId}) has no parentId`);
        console.log(`⚠️  Warning: Child ${child.name} has no parentId`);
        return;
      }
      
      if (!familyGroups[parentId]) {
        familyGroups[parentId] = [];
      }
      familyGroups[parentId].push(child);
    });
    
    const parentCount = Object.keys(familyGroups).length;
    console.log(`✅ Found ${parentCount} unique parents`);

    // ============================================
    // Step 3: Check existing families
    // ============================================
    console.log('🏠 Step 3: Checking existing families...');
    const familiesRef = ref(database, 'families');
    const familiesSnapshot = await get(familiesRef);
    
    const existingFamilies: { [key: string]: any } = {};
    if (familiesSnapshot.exists()) {
      const families = familiesSnapshot.val();
      Object.keys(families).forEach(familyId => {
        const family = families[familyId];
        if (family.parentId) {
          existingFamilies[family.parentId] = { id: familyId, ...family };
        }
      });
      console.log(`ℹ️  Found ${Object.keys(existingFamilies).length} existing families`);
    } else {
      console.log('ℹ️  No existing families found');
    }

    // ============================================
    // Step 4: Create or update families
    // ============================================
    console.log('🏗️  Step 4: Creating/Updating families...');
    console.log('=====================================');
    
    for (const parentId in familyGroups) {
      const childrenInFamily = familyGroups[parentId];
      const firstChild = childrenInFamily[0];
      
      try {
        // Get parent info from users
        const userRef = ref(database, `users/${parentId}`);
        const userSnapshot = await get(userRef);
        const parentData = userSnapshot.exists() ? userSnapshot.val() : {};
        
        const parentName = parentData.name || firstChild.name?.split(' ')[0] + "'s Parent" || 'Parent';
        const parentEmail = parentData.email || firstChild.email || '';
        
        console.log(`\n👨‍👩‍👦 Processing family for: ${parentName}`);
        console.log(`   Children count: ${childrenInFamily.length}`);
        
        // Check if family already exists
        let familyId: string;
        let isNewFamily = false;
        
        if (existingFamilies[parentId]) {
          // Update existing family
          familyId = existingFamilies[parentId].id;
          console.log(`   ℹ️  Family already exists (${familyId})`);
          
          // Update children list
          const childrenIds = childrenInFamily.map(c => c.id);
          await update(ref(database, `families/${familyId}`), {
            children: childrenIds,
            parentName: parentName,
            parentEmail: parentEmail,
            parentPhone: firstChild.phone || existingFamilies[parentId].parentPhone || '',
          });
          
          console.log(`   ✅ Updated family with ${childrenIds.length} children`);
          
        } else {
          // Create new family
          isNewFamily = true;
          const newFamilyRef = push(familiesRef);
          familyId = newFamilyRef.key || '';
          
          const familyData = {
            name: `${parentName} Family`,
            parentId: parentId,
            parentName: parentName,
            parentEmail: parentEmail,
            parentPhone: firstChild.phone || '',
            parentImage: '',
            timezone: parentData.timezone || 'Asia/Riyadh',
            address: '',
            children: childrenInFamily.map(c => c.id),
            status: 'active',
            createdAt: new Date().toISOString()
          };
          
          await set(newFamilyRef, familyData);
          
          console.log(`   ✅ Created new family: ${familyData.name}`);
          result.familiesCreated++;
        }
        
        // Update each child to ensure parentId is correct
        for (const child of childrenInFamily) {
          await update(ref(database, `children/${child.id}`), {
            parentId: parentId
          });
          result.childrenMigrated++;
        }
        
        // Add to result details
        result.familyDetails.push({
          familyId: familyId,
          familyName: `${parentName} Family`,
          parentName: parentName,
          childrenCount: childrenInFamily.length
        });
        
        console.log(`   ✅ Migrated ${childrenInFamily.length} children`);
        
      } catch (error: any) {
        const errorMsg = `Failed to process family for parent ${parentId}: ${error.message}`;
        result.errors.push(errorMsg);
        console.error(`   ❌ ${errorMsg}`);
      }
    }
    
    // ============================================
    // Step 5: Final Summary
    // ============================================
    console.log('\n=====================================');
    console.log('📊 MIGRATION SUMMARY');
    console.log('=====================================');
    console.log(`✅ Families Created: ${result.familiesCreated}`);
    console.log(`✅ Children Migrated: ${result.childrenMigrated}`);
    console.log(`⚠️  Errors: ${result.errors.length}`);
    
    if (result.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n📋 FAMILY DETAILS:');
    result.familyDetails.forEach((family, index) => {
      console.log(`   ${index + 1}. ${family.familyName} (${family.childrenCount} children)`);
    });
    
    result.success = result.errors.length === 0;
    console.log('\n✅ Migration completed successfully!');
    console.log('=====================================\n');
    
    return result;
    
  } catch (error: any) {
    console.error('❌ Fatal migration error:', error);
    result.errors.push(`Fatal error: ${error.message}`);
    result.success = false;
    return result;
  }
}

// ============================================
// VALIDATION FUNCTION
// ============================================

export async function validateMigration(): Promise<{
  isValid: boolean;
  issues: string[];
  stats: {
    totalChildren: number;
    totalFamilies: number;
    childrenWithoutFamily: number;
    familiesWithoutChildren: number;
  };
}> {
  const issues: string[] = [];
  const stats = {
    totalChildren: 0,
    totalFamilies: 0,
    childrenWithoutFamily: 0,
    familiesWithoutChildren: 0
  };

  try {
    console.log('🔍 Validating migration...');

    // Get all children
    const childrenRef = ref(database, 'children');
    const childrenSnapshot = await get(childrenRef);
    
    if (childrenSnapshot.exists()) {
      const children = childrenSnapshot.val();
      const activeChildren = Object.keys(children).filter(
        id => children[id].isActive !== false
      );
      stats.totalChildren = activeChildren.length;
    }

    // Get all families
    const familiesRef = ref(database, 'families');
    const familiesSnapshot = await get(familiesRef);
    
    if (familiesSnapshot.exists()) {
      const families = familiesSnapshot.val();
      const activeFamilies = Object.keys(families).filter(
        id => families[id].status === 'active'
      );
      stats.totalFamilies = activeFamilies.length;

      // Check families without children
      activeFamilies.forEach(id => {
        const family = families[id];
        if (!family.children || family.children.length === 0) {
          stats.familiesWithoutChildren++;
          issues.push(`Family "${family.name}" has no children`);
        }
      });
    }

    // Check children without families
    if (childrenSnapshot.exists() && familiesSnapshot.exists()) {
      const children = childrenSnapshot.val();
      const families = familiesSnapshot.val();
      
      Object.keys(children).forEach(childId => {
        const child = children[childId];
        if (child.isActive === false) return;
        
        const parentId = child.parentId;
        const hasFamily = Object.values(families).some((family: any) => 
          family.parentId === parentId && family.status === 'active'
        );
        
        if (!hasFamily) {
          stats.childrenWithoutFamily++;
          issues.push(`Child "${child.name}" has no family (Parent: ${parentId})`);
        }
      });
    }

    const isValid = issues.length === 0;
    
    console.log('✅ Validation complete');
    console.log(`   Total Children: ${stats.totalChildren}`);
    console.log(`   Total Families: ${stats.totalFamilies}`);
    console.log(`   Issues Found: ${issues.length}`);

    return { isValid, issues, stats };

  } catch (error: any) {
    console.error('❌ Validation error:', error);
    issues.push(`Validation error: ${error.message}`);
    return { isValid: false, issues, stats };
  }
}

// ============================================
// ROLLBACK FUNCTION
// ============================================

export async function rollbackMigration(): Promise<boolean> {
  try {
    console.log('🔄 Rolling back migration...');
    
    const familiesRef = ref(database, 'families');
    const familiesSnapshot = await get(familiesRef);
    
    if (familiesSnapshot.exists()) {
      const families = familiesSnapshot.val();
      const updates: any = {};
      
      Object.keys(families).forEach(familyId => {
        updates[`families/${familyId}/status`] = 'inactive';
      });
      
      await update(ref(database), updates);
      console.log('✅ Rollback complete - All families marked as inactive');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Rollback error:', error);
    return false;
  }
}