#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build web do Expo...\n');

// Limpar dist se existir
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('🧹 Limpando build anterior...');
  fs.rmSync(distPath, { recursive: true, force: true });
}

// Executar npx expo export -p web
const exportProcess = spawn('npx', ['expo', 'export', '-p', 'web'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, CI: '1', NODE_ENV: 'production' }
});

exportProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Build concluído com sucesso!');
    
    // Verificar se dist foi criado
    if (fs.existsSync(distPath)) {
      console.log('✅ Pasta dist criada com sucesso!');
      const files = fs.readdirSync(distPath);
      console.log(`📦 Arquivos gerados: ${files.length}`);
    } else {
      console.log('⚠️  Pasta dist não foi criada');
      process.exit(1);
    }
  } else {
    console.error(`\n❌ Build falhou com código ${code}`);
    process.exit(code);
  }
});

exportProcess.on('error', (err) => {
  console.error('❌ Erro ao executar build:', err);
  process.exit(1);
});
