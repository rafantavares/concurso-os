# 💻 Instruções para Rodar no Notebook em Casa

Este projeto agora roda **100% offline e local** utilizando SQLite nativo do Node.js, sem necessidade de Supabase em nuvem ou Docker.

Para continuar trabalhando ou estudando no notebook em casa:

---

## 1. No Notebook: Clonar e Instalar

Abra o terminal (Git Bash ou PowerShell) no seu notebook e execute:

```bash
# 1. Clone o projeto
git clone https://github.com/centrodemidiasto/concurso-os.git
cd concurso-os

# 2. Instale as dependências
npm install
```

---

## 2. Restaurar os Arquivos de Configuração

Copie os arquivos da pasta temporária `_temp_transfer` para a raiz:

### Se o notebook for Windows (PowerShell):
```powershell
Copy-Item _temp_transfer/.env .env
Copy-Item _temp_transfer/.env.local .env.local
Copy-Item -Recurse _temp_transfer/data ./data -Force
```

### Se o notebook for Mac/Linux ou Git Bash:
```bash
cp _temp_transfer/.env .env
cp _temp_transfer/.env.local .env.local
cp -r _temp_transfer/data ./data
```

---

## 3. Iniciar o Projeto no Notebook

```bash
npm run dev
```

Abra no navegador:
👉 **http://localhost:3000/dashboard**

---

## 4. Como Remover a Pasta Temporária do Git (Importante)

Depois de ter copiado os arquivos para a raiz no notebook e confirmado que tudo está rodando, remova a pasta temporária do Git para manter o repositório limpo e seguro:

```bash
git rm -r _temp_transfer
git commit -m "chore: remover arquivos temporarios de transferencia"
git push
```

> **Nota:** Seus arquivos `.env`, `.env.local` e `data/concurso.db` permanecerão intactos na sua máquina e no notebook, pois já estão protegidos pelo `.gitignore`.
