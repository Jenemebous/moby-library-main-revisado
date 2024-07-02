const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const ejs = require('ejs');
const LivroDAO = require('./app/daos/livroDAO');
const UsuarioDAO = require('./app/daos/usuarioDAO');

const app = express();
const port = 3000;

// Configurações do Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: '1234',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 }
}));

app.use(express.static('public'));
app.set('views', './app/views');
app.set('view engine', 'ejs');

// Rotas
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/perfil', (req, res) => {
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null;

    if (!id_usuario) {
        return res.redirect('/login');
    }

    LivroDAO.buscarTodosPorUsuario(id_usuario, (error, livros) => {
        if (error) {
            console.error('Erro ao buscar livros:', error);
            return res.status(500).send('Erro ao buscar livros');
        }

        const cincoPrimeirosLivros = livros.slice(0, 5);
        res.render('perfil', { nom_usuario: req.session.nom_usuario, livros: cincoPrimeirosLivros });
    });
});

app.get('/adicionar', (req, res) => {
    res.render('adicionar');
});

app.get('/editar', (req, res) => {
    res.render('editar');
});

app.get('/remover', (req, res) => {
    res.render('remover');
});

app.get('/visualizar', (req, res) => {
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null;

    if (!id_usuario) {
        return res.redirect('/login');
    }

    LivroDAO.buscarTodosPorUsuario(id_usuario, (error, livros) => {
        if (error) {
            console.error('Erro ao buscar livros:', error);
            return res.status(500).send('Erro ao buscar livros');
        }

        res.render('visualizar', { livros });
    });
});

app.get('/home-logado', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }

    const nom_usuario = req.session.nom_usuario;
    res.render('home-logado', { nom_usuario });
});
/*
// Rotas de ação
app.post('/login', (req, res) => {
    const { nom_usuario, senha } = req.body;

    if (senha.length !== 8) {
        return res.status(400).send('Senha deve ter exatamente 8 caracteres');
    }

    UsuarioDAO.buscarPorUsuario(nom_usuario, (error, usuarioEncontrado) => {
        if (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).send('Erro ao processar o login');
        }
        if (!usuarioEncontrado) {
            return res.status(401).send('Usuário ou senha incorretos');
        }
        bcrypt.compare(senha, usuarioEncontrado.senha, (err, result) => {
            if (err) {
                console.error('Erro ao comparar senhas:', err);
                return res.status(500).send('Erro ao processar o login');
            }
            if (result) {
                req.session.usuario = usuarioEncontrado;
                req.session.nom_usuario = nom_usuario;
                res.redirect('/home-logado');
            } else {
                res.status(401).send('Usuário ou senha incorretos');
            }
        });
    });
});
*/

app.post('/login', (req, res) => {
    const { nom_usuario, senha } = req.body;

    if (senha.length !== 8) {
        res.render('login', { error: 'Senha deve ter exatamente 8 caracteres' });
        return;
    }

    UsuarioDAO.buscarPorUsuario(nom_usuario, (error, usuarioEncontrado) => {
        if (error) {
            console.error('Erro ao buscar usuário:', error);
            res.render('login', { error: 'Erro ao processar o login' });
            return;
        }
        if (!usuarioEncontrado) {
            res.render('login', { error: 'Usuário ou senha incorretos' });
            return;
        }
        bcrypt.compare(senha, usuarioEncontrado.senha, (err, result) => {
            if (err) {
                console.error('Erro ao comparar senhas:', err);
                res.render('login', { error: 'Erro ao processar o login' });
                return;
            }
            if (result) {
                req.session.usuario = usuarioEncontrado;
                req.session.nom_usuario = nom_usuario;
                res.redirect('/home-logado');
            } else {
                res.render('login', { error: 'Usuário ou senha incorretos' });
            }
        });
    });
});

/*
app.post('/register', (req, res) => {
    const { nom_usuario, senha } = req.body;

    if (senha.length !== 8) {
        return res.status(400).send('Senha deve ter exatamente 8 caracteres');
    }

    UsuarioDAO.buscarPorUsuario(nom_usuario, (error, usuarioEncontrado) => {
        if (error) {
            console.error('Erro ao buscar usuário:', error);
            return res.status(500).send('Erro ao processar o registro');
        }
        if (usuarioEncontrado) {
            return res.status(400).send('Usuário já existe');
        }
        UsuarioDAO.adicionar(nom_usuario, senha, (error) => {
            if (error) {
                console.error('Erro ao adicionar usuário ao banco de dados:', error);
                return res.status(500).send('Erro ao processar o registro');
            }
            res.redirect('/login');
        });
    });
});
*/

app.post('/register', (req, res) => {
    const { nom_usuario, senha } = req.body;

    if (senha.length !== 8) {
        res.render('signup', { error: 'Senha deve ter exatamente 8 caracteres' });
        return;
    }

    UsuarioDAO.buscarPorUsuario(nom_usuario, (error, usuarioEncontrado) => {
        if (error) {
            console.error('Erro ao buscar usuário:', error);
            res.render('signup', { error: 'Erro ao processar o registro' });
            return;
        }
        if (usuarioEncontrado) {
            res.render('signup', { error: 'Usuário já existe' });
            return;
        }
        UsuarioDAO.adicionar(nom_usuario, senha, (error) => {
            if (error) {
                console.error('Erro ao adicionar usuário ao banco de dados:', error);
                res.render('signup', { error: 'Erro ao processar o registro' });
                return;
            }
            res.redirect('/login');
        });
    });
});


app.get('/usuario', (req, res) => {
    UsuarioDAO.buscarTodos((error, resultados) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao buscar usuários" });
        }
        res.status(200).json(resultados);
    });
});


app.post('/adicionarLivro', (req, res) => {
    const { titulo, autor, genero, ano_de_publicacao, sinopse } = req.body;
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null;

    if (!id_usuario) {
        return res.render('adicionar', { mensagem: 'Usuário não está logado', tipo: 'erro' });
    }

    // Validação dos dados do livro
    if (!titulo || !autor || !genero || !ano_de_publicacao || !sinopse) {
        return res.render('adicionar', { mensagem: 'Todos os campos são obrigatórios', tipo: 'erro' });
    }

    LivroDAO.adicionar(titulo, autor, genero, ano_de_publicacao, sinopse, id_usuario, (error) => {
        if (error) {
            console.error('Erro ao adicionar livro:', error);
            return res.render('adicionar', { mensagem: 'Erro ao adicionar livro', tipo: 'erro' });
        }
        res.render('adicionar', { mensagem: 'Livro adicionado com sucesso', tipo: 'sucesso' });
    });
});



// Rota para visualizar livros com pesquisa

app.get('/livros', (req, res) => {
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null;

    if (!id_usuario) {
        return res.redirect('/login');
    }

    const searchTerm = req.query.search;
    if (searchTerm) {
        LivroDAO.buscarPorTermoDePesquisa(searchTerm, id_usuario, (error, livros) => {
            if (error) {
                console.error('Erro ao buscar livros:', error);
                return res.status(500).send('Erro ao buscar livros');
            }
            res.render('visualizar', { livros });
        });
    } else {
        LivroDAO.buscarTodosPorUsuario(id_usuario, (error, livros) => {
            if (error) {
                console.error('Erro ao buscar livros:', error);
                return res.status(500).send('Erro ao buscar livros');
            }
            res.render('visualizar', { livros });
        });
    }
});

app.get('/livrosDoUsuario', (req, res) => {
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null;

    if (!id_usuario) {
        return res.status(401).send('Usuário não está logado');
    }

    LivroDAO.buscarTodosPorUsuario(id_usuario, (error, livros) => {
        if (error) {
            console.error('Erro ao buscar livros:', error);
            return res.status(500).send('Erro ao buscar livros');
        }
        res.json(livros);
    });
});

app.post('/removerLivros', (req, res) => {
    const id_livro = req.body.id_livro;
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null;

    if (!id_usuario) {
        return res.render('remover', { mensagem: 'Usuário não está logado', tipo: 'erro' });
    }

    LivroDAO.buscarTodosPorUsuario(id_usuario, (error, livros) => {
        if (error) {
            console.error('Erro ao buscar livros:', error);
            return res.render('remover', { mensagem: 'Erro ao buscar livros', tipo: 'erro' });
        }

        const livro = livros.find(livro => livro.id_livro == id_livro);
        if (!livro) {
            return res.render('remover', { mensagem: 'Você não tem permissão para remover este livro', tipo: 'erro' });
        }

        LivroDAO.remover(id_livro, (error) => {
            if (error) {
                console.error('Erro ao remover livro:', error);
                return res.render('remover', { mensagem: 'Erro ao remover livro', tipo: 'erro' });
            }
            res.render('remover', { mensagem: 'Livro removido com sucesso', tipo: 'sucesso' });
        });
    });
});

app.post('/editarLivro', (req, res) => {
    const { id, titulo, autor, sinopse } = req.body;

    // Validação dos dados do livro
    if (!id || !titulo || !autor || !sinopse) {
        return res.render('editar', { mensagem: 'Todos os campos são obrigatórios', tipo: 'erro' });
    }

    LivroDAO.editar(id, titulo, autor, sinopse, (error) => {
        if (error) {
            console.error('Erro ao editar livro:', error);
            return res.render('editar', { mensagem: 'Erro ao editar livro', tipo: 'erro' });
        }
        res.render('editar', { mensagem: 'Livro editado com sucesso', tipo: 'sucesso' });
    });
});


// Rota para visualizar livros
app.get('/visualizar', (req, res) => {
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null;

    if (!id_usuario) {
        return res.redirect('/login.html');
    }

    LivroDAO.buscarTodosPorUsuario(id_usuario, (error, livros) => {
        if (error) {
            console.error('Erro ao buscar livros:', error);
            return res.status(500).send('Erro ao buscar livros');
        }

        res.render('visualizar', { livros });
    });
});


//

app.get('/perfil', (req, res) => {
    const id_usuario = req.session.usuario ? req.session.usuario.id_usuario : null;

    if (!id_usuario) {
        return res.redirect('/login');
    }

    LivroDAO.buscarTodosPorUsuario(id_usuario, (error, livros) => {
        if (error) {
            console.error('Erro ao buscar livros:', error);
            return res.status(500).send('Erro ao buscar livros');
        }


        const cincoPrimeirosLivros = livros.slice(0, 5);


        res.render(__dirname + '/app/Views/perfil', { nom_usuario: req.session.nom_usuario, livros: cincoPrimeirosLivros });
    });
});

// Rota para fazer logout

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
        }
        res.redirect('/login');
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`http://localhost:${port}`);
});
