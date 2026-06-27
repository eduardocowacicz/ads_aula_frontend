DROP TABLE IF EXISTS tokens_recuperacao_senha CASCADE;
DROP TABLE IF EXISTS itens_orcamento CASCADE;
DROP TABLE IF EXISTS orcamentos CASCADE;
DROP TABLE IF EXISTS tokens_atualizacao_acesso CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP TYPE IF EXISTS tipo_situacao_orcamento CASCADE;
DROP TYPE IF EXISTS tipo_perfil_usuario CASCADE;

-- -----------------------------------------------------------------------------
-- 3) Tipos enumerados (domínio)
-- -----------------------------------------------------------------------------
CREATE TYPE tipo_situacao_orcamento AS ENUM (
  'pendente',
  'enviado',
  'aprovado',
  'rejeitado',
  'cancelado'
);

CREATE TYPE tipo_perfil_usuario AS ENUM (
  'administrador',
  'operador'
);

COMMENT ON TYPE tipo_situacao_orcamento IS 'Situação do orçamento no fluxo comercial.';
COMMENT ON TYPE tipo_perfil_usuario IS 'Perfil de acesso do usuário interno do sistema.';

-- -----------------------------------------------------------------------------
-- 4) Tabelas
-- -----------------------------------------------------------------------------

CREATE TABLE usuarios (
  id serial PRIMARY KEY,
  email varchar(255) NOT NULL,
  hash_senha varchar(255) NOT NULL,
  nome_completo varchar(200) NOT NULL,
  perfil tipo_perfil_usuario NOT NULL DEFAULT 'operador',
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_usuarios_email UNIQUE (email)
);

COMMENT ON TABLE usuarios IS 'Usuários internos que autenticam no sistema (operadores/administradores).';
COMMENT ON COLUMN usuarios.id IS 'Identificador único (autoincremento).';
COMMENT ON COLUMN usuarios.email IS 'Endereço de e-mail utilizado no login; deve ser único.';
COMMENT ON COLUMN usuarios.hash_senha IS 'Hash da senha (nunca armazenar senha em texto puro).';
COMMENT ON COLUMN usuarios.nome_completo IS 'Nome completo para exibição e perfil.';
COMMENT ON COLUMN usuarios.perfil IS 'Nível de permissão no sistema.';
COMMENT ON COLUMN usuarios.ativo IS 'Indica se o usuário pode autenticar (false bloqueia acesso).';
COMMENT ON COLUMN usuarios.criado_em IS 'Data e hora de criação do registro.';
COMMENT ON COLUMN usuarios.atualizado_em IS 'Data e hora da última atualização do registro.';

CREATE TABLE clientes (
  id serial PRIMARY KEY,
  nome varchar(200) NOT NULL,
  documento varchar(20),
  email varchar(255),
  telefone varchar(30),
  observacoes text,
  usuario_criador_id integer REFERENCES usuarios (id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_clientes_documento UNIQUE (documento)
);

COMMENT ON TABLE clientes IS 'Clientes externos (PF/PJ) que recebem orçamentos.';
COMMENT ON COLUMN clientes.id IS 'Identificador único (autoincremento).';
COMMENT ON COLUMN clientes.nome IS 'Nome ou razão social.';
COMMENT ON COLUMN clientes.documento IS 'CPF ou CNPJ sem máscara; opcional e único quando informado.';
COMMENT ON COLUMN clientes.email IS 'E-mail de contato.';
COMMENT ON COLUMN clientes.telefone IS 'Telefone de contato.';
COMMENT ON COLUMN clientes.observacoes IS 'Anotações internas sobre o cliente.';
COMMENT ON COLUMN clientes.usuario_criador_id IS 'Usuário interno que cadastrou o cliente (auditoria).';
COMMENT ON COLUMN clientes.criado_em IS 'Data e hora de criação do registro.';
COMMENT ON COLUMN clientes.atualizado_em IS 'Data e hora da última atualização do registro.';

CREATE TABLE produtos (
  id serial PRIMARY KEY,
  codigo_sku varchar(80),
  nome varchar(200) NOT NULL,
  descricao text,
  preco_unitario numeric(14, 2) NOT NULL,
  unidade varchar(20) NOT NULL DEFAULT 'UN',
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_produtos_codigo_sku UNIQUE (codigo_sku),
  CONSTRAINT ck_produtos_preco_positivo CHECK (preco_unitario >= 0)
);

COMMENT ON TABLE produtos IS 'Catálogo de produtos ou serviços vendidos.';
COMMENT ON COLUMN produtos.id IS 'Identificador único (autoincremento).';
COMMENT ON COLUMN produtos.codigo_sku IS 'Código interno ou SKU; único quando informado.';
COMMENT ON COLUMN produtos.nome IS 'Nome do produto ou serviço.';
COMMENT ON COLUMN produtos.descricao IS 'Descrição detalhada opcional.';
COMMENT ON COLUMN produtos.preco_unitario IS 'Preço unitário de referência.';
COMMENT ON COLUMN produtos.unidade IS 'Unidade de medida (ex.: UN, M2, H).';
COMMENT ON COLUMN produtos.ativo IS 'Se falso, o item não deve aparecer em novas buscas de orçamento.';
COMMENT ON COLUMN produtos.criado_em IS 'Data e hora de criação do registro.';
COMMENT ON COLUMN produtos.atualizado_em IS 'Data e hora da última atualização do registro.';

CREATE TABLE orcamentos (
  id serial PRIMARY KEY,
  cliente_id integer NOT NULL REFERENCES clientes (id) ON DELETE RESTRICT,
  usuario_autor_id integer NOT NULL REFERENCES usuarios (id) ON DELETE RESTRICT,
  situacao tipo_situacao_orcamento NOT NULL DEFAULT 'pendente',
  subtotal numeric(14, 2) NOT NULL DEFAULT 0,
  valor_desconto numeric(14, 2) NOT NULL DEFAULT 0,
  total numeric(14, 2) NOT NULL DEFAULT 0,
  valido_ate date,
  observacoes text,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ck_orcamentos_subtotal CHECK (subtotal >= 0),
  CONSTRAINT ck_orcamentos_desconto CHECK (valor_desconto >= 0),
  CONSTRAINT ck_orcamentos_total CHECK (total >= 0)
);

COMMENT ON TABLE orcamentos IS 'Cabeçalho do orçamento vinculado a um cliente e ao usuário autor.';
COMMENT ON COLUMN orcamentos.id IS 'Identificador único (autoincremento).';
COMMENT ON COLUMN orcamentos.cliente_id IS 'Cliente ao qual o orçamento se refere.';
COMMENT ON COLUMN orcamentos.usuario_autor_id IS 'Usuário interno que criou ou é responsável pelo orçamento.';
COMMENT ON COLUMN orcamentos.situacao IS 'Estágio atual do orçamento no processo comercial.';
COMMENT ON COLUMN orcamentos.subtotal IS 'Soma dos itens antes de descontos adicionais do cabeçalho.';
COMMENT ON COLUMN orcamentos.valor_desconto IS 'Valor absoluto de desconto aplicado ao cabeçalho.';
COMMENT ON COLUMN orcamentos.total IS 'Valor final do orçamento.';
COMMENT ON COLUMN orcamentos.valido_ate IS 'Data limite de validade comercial do orçamento.';
COMMENT ON COLUMN orcamentos.observacoes IS 'Observações gerais do orçamento.';
COMMENT ON COLUMN orcamentos.criado_em IS 'Data e hora de criação do registro.';
COMMENT ON COLUMN orcamentos.atualizado_em IS 'Data e hora da última atualização do registro.';

CREATE TABLE itens_orcamento (
  id serial PRIMARY KEY,
  orcamento_id integer NOT NULL REFERENCES orcamentos (id) ON DELETE CASCADE,
  produto_id integer NOT NULL REFERENCES produtos (id) ON DELETE RESTRICT,
  nome_produto_registro varchar(200) NOT NULL,
  preco_unitario_registro numeric(14, 2) NOT NULL,
  quantidade numeric(14, 4) NOT NULL,
  total_linha numeric(14, 2) NOT NULL,
  CONSTRAINT ck_itens_quantidade_positiva CHECK (quantidade > 0),
  CONSTRAINT ck_itens_preco_unitario CHECK (preco_unitario_registro >= 0),
  CONSTRAINT ck_itens_total_linha CHECK (total_linha >= 0)
);

COMMENT ON TABLE itens_orcamento IS 'Itens de linha do orçamento com cópia de nome e preço para histórico.';
COMMENT ON COLUMN itens_orcamento.id IS 'Identificador único (autoincremento).';
COMMENT ON COLUMN itens_orcamento.orcamento_id IS 'Orçamento ao qual a linha pertence.';
COMMENT ON COLUMN itens_orcamento.produto_id IS 'Referência ao produto cadastrado no momento da inclusão.';
COMMENT ON COLUMN itens_orcamento.nome_produto_registro IS 'Cópia do nome do produto no momento do orçamento.';
COMMENT ON COLUMN itens_orcamento.preco_unitario_registro IS 'Preço unitário negociado/registrado na linha.';
COMMENT ON COLUMN itens_orcamento.quantidade IS 'Quantidade do item.';
COMMENT ON COLUMN itens_orcamento.total_linha IS 'Total da linha (normalmente quantidade × preço unitário).';

CREATE TABLE tokens_atualizacao_acesso (
  id serial PRIMARY KEY,
  usuario_id integer NOT NULL REFERENCES usuarios (id) ON DELETE CASCADE,
  hash_token varchar(255) NOT NULL,
  expira_em timestamptz NOT NULL,
  revogado_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE tokens_atualizacao_acesso IS 'Tokens de atualização (refresh) para sessão JWT; opcional conforme estratégia de auth.';
COMMENT ON COLUMN tokens_atualizacao_acesso.id IS 'Identificador único (autoincremento).';
COMMENT ON COLUMN tokens_atualizacao_acesso.usuario_id IS 'Usuário dono do refresh token.';
COMMENT ON COLUMN tokens_atualizacao_acesso.hash_token IS 'Hash do refresh token (não persistir token em claro).';
COMMENT ON COLUMN tokens_atualizacao_acesso.expira_em IS 'Momento de expiração do refresh token.';
COMMENT ON COLUMN tokens_atualizacao_acesso.revogado_em IS 'Momento da revogação manual ou logout; nulo se ativo.';
COMMENT ON COLUMN tokens_atualizacao_acesso.criado_em IS 'Data e hora de criação do registro.';

-- -----------------------------------------------------------------------------
-- 5) Índices auxiliares
-- -----------------------------------------------------------------------------
CREATE INDEX idx_orcamentos_criado_em ON orcamentos (criado_em);
CREATE INDEX idx_orcamentos_situacao ON orcamentos (situacao);
CREATE INDEX idx_produtos_criado_em ON produtos (criado_em DESC);
CREATE INDEX idx_tokens_atualizacao_usuario ON tokens_atualizacao_acesso (usuario_id);

-- -----------------------------------------------------------------------------
-- 6) Gatilhos: manter atualizado_em em UPDATE
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_definir_atualizado_em()
RETURNS trigger AS $$
BEGIN
  NEW.atualizado_em := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION trg_definir_atualizado_em() IS 'Atualiza automaticamente a coluna atualizado_em antes de UPDATE.';

CREATE TRIGGER usuarios_atualizado_em
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE PROCEDURE trg_definir_atualizado_em();

CREATE TRIGGER clientes_atualizado_em
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE PROCEDURE trg_definir_atualizado_em();

CREATE TRIGGER produtos_atualizado_em
  BEFORE UPDATE ON produtos
  FOR EACH ROW
  EXECUTE PROCEDURE trg_definir_atualizado_em();

CREATE TRIGGER orcamentos_atualizado_em
  BEFORE UPDATE ON orcamentos
  FOR EACH ROW
  EXECUTE PROCEDURE trg_definir_atualizado_em();
