// Automated verification test for Master editing other user accounts with Master password authorization
const store: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (k: string) => store[k] || null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};

import {
  authenticateAdmin,
  createAdminUser,
  getStoredAdminUsers,
  getCurrentAdminUser,
  setCurrentAdminUser,
  updateAdminUser,
} from './src/services/storage';

console.log('=== TESTES DE VALIDAÇÃO: EDIÇÃO DE CONTAS PELO MESTRE COM AUTORIZAÇÃO DE SENHA ===');

// Setup: Master logs in and creates user 'muller' (role: admin)
const masterLogin = authenticateAdmin('master', 'rocknet2026');
const masterUser = masterLogin.user!;
console.log(`✓ 1. Mestre autenticado: @${masterUser.username}`);

const createMullerRes = createAdminUser(masterUser.id, {
  name: 'Muller Antigo',
  username: 'muller',
  password: 'senhaMullerAntiga',
  role: 'admin',
});
const mullerUser = createMullerRes.user!;
console.log(`✓ 2. Conta inicial criada: @${mullerUser.username} (${mullerUser.name})`);

// TESTE 1: Um usuário NÃO MESTRE (ex: admin comum) tenta editar a conta de outro usuário
const test1 = updateAdminUser(
  mullerUser.id,           // Editor (admin comum)
  'senhaMullerAntiga',     // Senha do editor
  masterUser.id,           // Alvo
  { name: 'Hack Name' }
);
if (!test1.success && test1.error?.includes('Apenas usuários com perfil Mestre')) {
  console.log('✓ TESTE 1 PASSOU: Usuário não-Mestre foi BLOQUEADO ao tentar editar conta!');
} else {
  console.error('✗ TESTE 1 FALHOU:', test1);
  process.exit(1);
}

// TESTE 2: O Mestre tenta editar a conta de 'muller', mas erra a sua própria senha de Mestre
const test2 = updateAdminUser(
  masterUser.id,           // Editor (Mestre)
  'senha_errada_do_mestre',// Senha errada do Mestre
  mullerUser.id,           // Alvo
  { name: 'Muller Modificado', username: 'muller_novo' }
);
if (!test2.success && test2.error?.includes('Senha do Usuário Mestre incorreta')) {
  console.log('✓ TESTE 2 PASSOU: Edição com senha incorreta do Mestre foi REJEITADA com sucesso!');
} else {
  console.error('✗ TESTE 2 FALHOU:', test2);
  process.exit(1);
}

// Verifica se os dados de muller continuam intactos após a tentativa com senha errada
const usersAfterFailedEdit = getStoredAdminUsers();
const mullerUntouched = usersAfterFailedEdit.find(u => u.id === mullerUser.id)!;
if (mullerUntouched.name === 'Muller Antigo' && mullerUntouched.username === 'muller') {
  console.log('✓ TESTE 2.1 PASSOU: Dados da conta de @muller permaneceram 100% inalterados!');
} else {
  console.error('✗ TESTE 2.1 FALHOU: Dados foram alterados indevidamente:', mullerUntouched);
  process.exit(1);
}

// TESTE 3: O Mestre edita os dados de 'muller' E fornece a senha CORRETA de Mestre ('rocknet2026')
const test3 = updateAdminUser(
  masterUser.id,           // Editor (Mestre)
  'rocknet2026',           // Senha CORRETA do Mestre
  mullerUser.id,           // Alvo
  {
    name: 'Muller Atualizado Silva',
    username: 'muller_tech',
    role: 'admin',
    newPassword: 'novaSenhaMuller@2026',
  }
);

if (test3.success && test3.user?.username === 'muller_tech' && test3.user?.name === 'Muller Atualizado Silva') {
  console.log('✓ TESTE 3 PASSOU: Mestre autorizou com sucesso a edição da conta com a senha do Mestre!');
} else {
  console.error('✗ TESTE 3 FALHOU:', test3);
  process.exit(1);
}

// TESTE 4: Teste de login da conta editada com a SENHA ANTIGA (deve falhar)
const test4OldLogin = authenticateAdmin('muller_tech', 'senhaMullerAntiga');
if (!test4OldLogin.success) {
  console.log('✓ TESTE 4 PASSOU: Login de @muller_tech com a senha antiga foi rejeitado!');
} else {
  console.error('✗ TESTE 4 FALHOU: Conseguiu logar com senha antiga!');
  process.exit(1);
}

// TESTE 5: Teste de login da conta editada com a NOVA SENHA definida pelo Mestre (deve ter sucesso)
const test5NewLogin = authenticateAdmin('muller_tech', 'novaSenhaMuller@2026');
if (test5NewLogin.success && test5NewLogin.user?.username === 'muller_tech') {
  console.log('✓ TESTE 5 PASSOU: Login de @muller_tech com a nova senha autorizada pelo Mestre funcionou perfeitamente!');
} else {
  console.error('✗ TESTE 5 FALHOU:', test5NewLogin);
  process.exit(1);
}

// TESTE 6: O Mestre promove 'muller_tech' para Mestre também
const test6Promote = updateAdminUser(
  masterUser.id,
  'rocknet2026',
  mullerUser.id,
  { role: 'master' }
);
if (test6Promote.success && test6Promote.user?.role === 'master') {
  console.log('✓ TESTE 6 PASSOU: Mestre alterou permissão da conta para Mestre com sucesso!');
} else {
  console.error('✗ TESTE 6 FALHOU:', test6Promote);
  process.exit(1);
}

console.log('=== TODOS OS TESTES DE EDIÇÃO DE CONTA PASSARAM COM 100% DE SUCESSO! ===');
