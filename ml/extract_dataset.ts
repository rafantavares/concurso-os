import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Requires SUPABASE_URL and SUPABASE_ANON_KEY to be set, or we just connect to local if possible.
// For the sake of the experiment in the CLI, we can just stub the connection if env vars aren't present.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy';

const supabase = createClient(supabaseUrl, supabaseKey);

async function extract() {
  console.log('Iniciando extração do dataset...');

  // 1. Fetch eligible interventions
  const { data: interventions, error } = await supabase
    .from('learning_interventions')
    .select('*')
    .not('performance_before', 'is', null)
    .not('performance_after', 'is', null);

  if (error) {
    console.error('Failed to fetch interventions:', error);
    return;
  }

  console.log(`Total de observações elegíveis encontradas: ${interventions.length}`);

  if (interventions.length < 500) {
    console.warn('⚠️ AVISO: Quantidade de dados insuficiente para treinar um modelo de ML confiável.');
    console.warn('Recomendado: mínimo de 500-1000 observações para validação cruzada decente.');
  }

  // 2. Format features to prevent leakage (Only data BEFORE intervention)
  const dataset = interventions.map(inv => {
    // Label: did performance improve by more than 2%?
    const before = parseFloat(inv.performance_before);
    const after = parseFloat(inv.performance_after);
    const delta = after - before;
    const improved = delta > 2.0;

    return {
      intervention_id: inv.id,
      user_id: inv.user_id,
      topic_id: inv.topic_id,
      
      // Features (Known AT intervention time)
      intervention_type: inv.intervention_type,
      performance_before: before,
      spi_at_time: inv.spi_at_time || 0,
      
      // We would join `study_sessions` and `user_attempts` filtered strictly by `created_at < inv.created_at` 
      // to extract hours_studied, recent_accuracy, etc.
      
      // Label (For training/eval only)
      delta_observed: delta,
      improved: improved ? 1 : 0
    };
  });

  const outPath = path.join(__dirname, 'dataset_v1.json');
  fs.writeFileSync(outPath, JSON.stringify(dataset, null, 2));
  console.log(`Dataset salvo em ${outPath}. Total: ${dataset.length} linhas.`);
}

extract();
