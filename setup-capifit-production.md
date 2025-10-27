# 🦫 CapiFit - Guia Completo de Implantação para Produção

## 📋 O que ainda falta para sistema totalmente funcional

### 1. **Banco de Dados Real - Supabase**
```bash
# 1. Criar conta no Supabase (https://supabase.com)
# 2. Criar novo projeto
# 3. Configurar as seguintes tabelas:

-- Usuários e Autenticação
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  role VARCHAR(20) CHECK (role IN ('trainer', 'client', 'admin')),
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Clientes
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  birth_date DATE,
  emergency_contact TEXT,
  medical_conditions TEXT,
  goals TEXT,
  subscription_status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercícios
CREATE TABLE exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  muscle_groups TEXT[],
  equipment TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  instructions TEXT,
  video_url TEXT,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id),
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treinos
CREATE TABLE workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  exercises JSONB,
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avaliações Físicas
CREATE TABLE physical_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_date DATE,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  body_fat_percentage DECIMAL(5,2),
  muscle_mass DECIMAL(5,2),
  measurements JSONB,
  photos JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alimentos
CREATE TABLE foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  calories_per_100g INTEGER,
  proteins_per_100g DECIMAL(5,2),
  carbs_per_100g DECIMAL(5,2),
  fats_per_100g DECIMAL(5,2),
  fiber_per_100g DECIMAL(5,2),
  created_by UUID REFERENCES profiles(id),
  is_custom BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Planos Alimentares
CREATE TABLE meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  meals JSONB,
  total_calories INTEGER,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mensagens/Chat
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notificações
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50),
  priority VARCHAR(20) DEFAULT 'medium',
  is_read BOOLEAN DEFAULT false,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pagamentos/Assinaturas
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_name TEXT,
  amount DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'BRL',
  billing_cycle VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. **Variáveis de Ambiente (.env)**
```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-supabase

# Opcional - Para funcionalidades avançadas
VITE_OPENAI_API_KEY=sua-chave-openai (para IA)
VITE_GOOGLE_ANALYTICS_ID=seu-id-analytics
VITE_STRIPE_PUBLISHABLE_KEY=sua-chave-stripe (para pagamentos)
```

### 3. **Row Level Security (RLS) - Supabase**
```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE physical_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança (exemplos)
-- Usuários podem ver apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Trainers podem ver seus clientes
CREATE POLICY "Trainers can view their clients" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'trainer'
      AND trainer_id = auth.uid()
    )
  );

-- Clientes podem ver apenas seus próprios dados
CREATE POLICY "Clients can view own data" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'client'
      AND clients.id = profiles.id
    )
  );
```

### 4. **Instalação de Dependências Supabase**
```bash
npm install @supabase/supabase-js
```

### 5. **Arquivo de Configuração Supabase (src/lib/supabase.js)**
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUp = async (email, password, userData) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
```

### 6. **Implantação no VPS Ubuntu 24.04 LTS**

#### A. **Preparação do Servidor**
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (versão 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Nginx
sudo apt install nginx -y

# Instalar PM2 para gerenciar a aplicação
sudo npm install -g pm2
```

#### B. **Deploy da Aplicação**
```bash
# 1. Clonar ou fazer upload do código
cd /var/www/
sudo git clone https://github.com/seu-usuario/capifit.git
# ou fazer upload via SCP/SFTP

# 2. Instalar dependências
cd capifit
sudo npm install

# 3. Configurar variáveis de ambiente
sudo nano .env
# Adicionar as variáveis de produção

# 4. Build da aplicação
sudo npm run build

# 5. Configurar PM2
sudo pm2 start npm --name "capifit" -- run preview
sudo pm2 startup
sudo pm2 save
```

#### C. **Configuração do Nginx**
```bash
sudo nano /etc/nginx/sites-available/capifit
```

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    location / {
        proxy_pass http://localhost:4173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/capifit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### D. **SSL com Let's Encrypt (Opcional)**
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

### 7. **Atualização do Sistema de Autenticação**

Substitua o localStorage mock por autenticação real do Supabase:

```javascript
// src/hooks/useAuth.js
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar usuário atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  return { user, loading }
}
```

### 8. **Funcionalidades para Implementar**

#### Sistema de Upload de Arquivos (Supabase Storage)
```javascript
// Upload de fotos de progresso e documentos
const uploadFile = async (file, bucket, path) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file)
  return { data, error }
}
```

#### Sistema de Pagamentos (Stripe)
```javascript
// Integração com Stripe para assinaturas
import { loadStripe } from '@stripe/stripe-js'
const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
```

#### Sistema de Notificações Push
```javascript
// Notificações do navegador
const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}
```

### 9. **Teste Final**

Após implantação, teste:
- ✅ Cadastro e login de usuários
- ✅ Criação e gestão de clientes
- ✅ Sistema de treinos e exercícios
- ✅ Avaliações físicas
- ✅ Chat e mensageria
- ✅ Planos alimentares
- ✅ Notificações
- ✅ Upload de arquivos
- ✅ Responsividade mobile

### 10. **Monitoramento e Backup**

```bash
# Backup automático do banco de dados
# Configurar no Supabase Dashboard > Settings > Database > Backups

# Monitoramento de logs
sudo pm2 logs capifit

# Monitoramento de recursos
sudo pm2 monit
```

---

## 🚀 **Próximos Passos**

1. **Configurar Supabase** com as tabelas fornecidas
2. **Atualizar .env** com credenciais reais
3. **Instalar dependências** do Supabase
4. **Refatorar autenticação** para usar Supabase Auth
5. **Substituir dados mock** por consultas reais
6. **Deploy no VPS** seguindo o guia
7. **Configurar domínio** e SSL
8. **Testar todas funcionalidades**

Com essas implementações, o CapiFit se tornará um sistema totalmente funcional e profissional para personal trainers!