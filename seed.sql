-- Execute após aplicar banco.sql no mesmo banco (DATABASE_NAME).
-- Senha do usuário demo: senha123
-- Assume usuário id=1 (primeiro INSERT) para vínculos em clientes.

-- Hash bcrypt de "senha123" (senha do demo). Em conflito de e-mail, atualiza o hash
-- para que reaplicar o seed corrija login se o usuário já existia com senha antiga.
INSERT INTO usuarios (email, hash_senha, nome_completo, perfil, ativo)
VALUES (
  'demo@sistema.local',
  '$2b$10$.xa.EubSZmRoIwKhfq3ecetw/Lxvy717MNeAatTqx5JWQ3ZCPlAfe',
  'Usuário Demonstração',
  'operador',
  true
)
ON CONFLICT (email) DO UPDATE SET
  hash_senha = EXCLUDED.hash_senha,
  nome_completo = EXCLUDED.nome_completo,
  perfil = EXCLUDED.perfil,
  ativo = EXCLUDED.ativo;

INSERT INTO clientes (nome, documento, email, telefone, observacoes, usuario_criador_id)
VALUES
  ('Marcenaria Silva Ltda', '11222333000181', 'contato@marcenariasilva.com.br', '1133334444', 'Cliente desde 2024', 1),
  ('João Pedro Santos', '10000000001', 'joao.santos@email.com', '11987654321', NULL, 1),
  ('Móveis Planejados Costa', '22333444000172', 'orcamentos@moveiscosta.com', '2134445566', 'Prefere orçamento por e-mail', 1),
  ('Ana Carolina Ferreira', '10000000002', 'ana.ferreira@email.com', '11976543210', NULL, 1),
  ('Indústria de Peças Norte', '33444555000163', 'compras@pecasnorte.ind.br', '8532119988', 'PJ — segmento metalúrgico', 1),
  ('Carlos Eduardo Lima', '10000000003', 'carlos.lima@email.com', '11965432109', NULL, 1),
  ('Carpintaria do Bairro ME', '44555666000154', 'carpintariabairro@uol.com.br', '4733221100', NULL, 1),
  ('Mariana Oliveira Rocha', '10000000004', 'mariana.rocha@email.com', '11954321098', NULL, 1),
  ('Loja de Ferragens Central', '55666777000145', 'central@ferragenscentral.com', '1132114455', 'Grande volume de parafusos', 1),
  ('Roberto Dias Mendes', '10000000005', 'roberto.mendes@email.com', '11943210987', NULL, 1),
  ('Construtora Horizonte SA', '66777888000136', 'suprimentos@horizonte.com.br', '2139887766', NULL, 1),
  ('Patricia Souza Almeida', '10000000006', 'patricia.almeida@email.com', '11932109876', NULL, 1)
ON CONFLICT (documento) DO NOTHING;

INSERT INTO produtos (codigo_sku, nome, descricao, preco_unitario, unidade, ativo)
VALUES
  ('MDF-18', 'MDF 18mm branco 2,75x1,84m', 'Chapa MDF cru/branco', 189.9, 'UN', true),
  ('PARAF-M4', 'Parafuso chipboard 4x40 mm', 'Caixa com 100 unidades', 24.5, 'CX', true),
  ('MDF-15', 'MDF 15mm branco 2,75x1,84m', 'Chapa MDF para móveis leves', 159.0, 'UN', true),
  ('COLA-PVA1', 'Cola branca PVA 1 kg', 'Uso geral em madeira', 18.9, 'UN', true),
  ('BIS-35', 'Bisagra 35 mm com amortecedor', 'Par — 2 unidades na embalagem', 32.0, 'PAR', true),
  ('PUX-128', 'Puxador alumínio 128 mm', 'Acabamento escovado', 12.75, 'UN', true),
  ('FIT-19', 'Fita de borda PVC 19 mm x 20 m', 'Cor branco gelo', 45.0, 'RL', true),
  ('CAV-6', 'Cavilha madeira 6x30 mm', 'Saco 100 unidades', 15.9, 'SC', true),
  ('POR-3', 'Porca garra 3/16"', 'Para parafuso confirmat', 0.35, 'UN', true),
  ('PARAF-50', 'Parafuso chipboard 5x50 mm', 'Caixa com 100 unidades', 28.0, 'CX', true),
  ('CHAPA-OSB', 'OSB 11mm 2,44x1,22m', 'Estrutural / canteiro', 95.0, 'UN', true),
  ('LIQ-A', 'Lixa madeira grão 120', 'Pacote com 10 folhas', 22.5, 'PC', true)
ON CONFLICT (codigo_sku) DO NOTHING;
