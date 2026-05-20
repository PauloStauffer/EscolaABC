// ======================================
// INSTALAR:
// npm install express mssql cors
//
// EXECUTAR:
// node server.js
// ======================================

const express = require('express')
const sql = require('mssql')
const cors = require('cors')
const path = require('path')

const app = express()

// ======================================
// MIDDLEWARES
// ======================================

app.use(cors())
app.use(express.json())

// ======================================
// LIBERAR PASTA PUBLIC
// ======================================

app.use(express.static(path.join(__dirname, 'public')))

// ======================================
// CONFIGURAÇÃO AZURE SQL
// ======================================

const config = {

    user: 'ninzgx',

    password: 'Senha123!',

    server: 'serverninzgx.database.windows.net',

    database: 'EscolaABC_oficial',

    options: {
        encrypt: true,
        trustServerCertificate: false
    }

}

// ======================================
// CONEXÃO SQL
// ======================================

sql.connect(config)

.then(() => {

    console.log('Conectado ao Azure SQL')

})

.catch((erro) => {

    console.log('Erro ao conectar no Azure SQL')
    console.log(erro)

})

// ======================================
// ROTA PRINCIPAL
// ======================================

app.get('/', (req, res) => {

    res.sendFile(
        path.join(__dirname, 'public', 'Login.html')
    )

})

// ======================================
// TESTE SERVIDOR
// ======================================

app.get('/teste', (req, res) => {

    res.json({

        sucesso: true,
        mensagem: 'Servidor funcionando'

    })

})

// ======================================
// TESTE SQL
// ======================================

app.get('/sql', async (req, res) => {

    try {

        const resultado =
            await sql.query(
                'SELECT 1 AS teste'
            )

        res.json(resultado.recordset)

    }

    catch (erro) {

        console.log(erro)

        res.status(500).json({

            sucesso: false,
            erro: erro.message

        })

    }

})

// ======================================
// LOGIN
// ======================================

app.post('/login', async (req, res) => {

    try {

        const {
            matricula,
            senha,
            tipo
        } = req.body

        console.log(req.body)

        // VALIDAÇÃO
        if (!matricula || !senha || !tipo) {

            return res.status(400).json({

                sucesso: false,
                mensagem: 'Preencha todos os campos'

            })

        }

        // DEFINIR TABELA
        let tabela = ''

        if (tipo === 'Aluno') {

            tabela = 'Alunos'

        }

        else if (tipo === 'Professor') {

            tabela = 'Professores'

        }

        else {

            return res.status(400).json({

                sucesso: false,
                mensagem: 'Tipo inválido'

            })

        }

        // SQL REQUEST
        const request = new sql.Request()

        request.input(
            'matricula',
            sql.VarChar,
            matricula
        )

        request.input(
            'senha',
            sql.VarChar,
            senha
        )

        // CONSULTA
        const resultado = await request.query(`
            SELECT *
            FROM ${tabela}
            WHERE Matricula = @matricula
            AND Senha = @senha
        `)

        // LOGIN OK
        if (resultado.recordset.length > 0) {

            const usuario =
                resultado.recordset[0]

            return res.json({

                sucesso: true,

                mensagem:
                    'Login realizado com sucesso',

                usuario: {

                    id: usuario.ID_Alunos || usuario.ID_Professores,

                    nome: usuario.Nome,

                    matricula: usuario.Matricula,

                    tipo: tipo

                    }

            })

        }

        // LOGIN INVÁLIDO
        else {

            return res.json({

                sucesso: false,

                mensagem:
                    'Matrícula ou senha incorretas'

            })

        }

    }

    catch (erro) {

        console.log(erro)

        res.status(500).json({

            sucesso: false,
            erro: erro.message

        })

    }

})

// ======================================
// ROTA 404
// ======================================

app.use((req, res) => {

    res.status(404).send(`
        <h1>404 - Página não encontrada</h1>
    `)

})

// ======================================
// SERVIDOR
// ======================================

app.listen(3000, () => {

    console.log('================================')
    console.log('Servidor rodando:')
    console.log('http://localhost:3000')
    console.log('================================')

})

// ======================================
// BOLETIM
// ======================================

app.get('/boletim/:id', async (req, res) => {

    try {

        const id = req.params.id

        const request = new sql.Request()

        request.input(
            'id',
            sql.Int,
            id
        )

        const resultado =
            await request.query(`

                SELECT *
                FROM vw_BoletimAluno
                WHERE ID_Alunos = @id

            `)

        res.json(resultado.recordset)

    }

    catch (erro) {

        console.log(erro)

        res.status(500).json({

            sucesso: false,
            erro: erro.message

        })

    }

})