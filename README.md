# Visualizador 3D de Móveis Interativo

**Universidade Federal do Ceará - Campus Sobral**  
**Curso: Engenharia da Computação**  
**Professor:** Iális Cavalcante de Paula Junior  
**Disciplina:** Computação Gráfica, 2026.1

---

## Sobre o Projeto

Este projeto foi desenvolvido para o Trabalho Prático 1 da disciplina de Computação Gráfica. É uma ferramenta de e-commerce voltada para o setor de mobília e decoração, que permite que o usuário visualize e personalize os produtos em um ambiente tridimensional.

O objetivo central é evitar o problema de devoluções e insatisfação na compra online, oferecendo um visualizador de alta fidelidade no qual é possível analisar o formato e/ou modelo e visualizar a incidência de luz antes da aquisição do produto.

---

## Equipe

* Eros Ryan Simette
* Christian Ximenes Paiva
* Antônio Kíldere Sousa Menezes
* Pedro Levi Moura Ximenes
* Taynara de Araújo Alves
* Emanoel Igor de Paulo Cosmo
* Gustavo Fontenele Barros

---

## Instruções de Execução

1. Clone o repositório oficial:
```bash
   git clone https://github.com/Eros-afk/Trabalho-Computacao-Grafica/
```

2. Navegue até o diretório do projeto:
```bash
   cd Trabalho-Computacao-Grafica
```

3. Para a correta visualização dos modelos 3D (devido às restrições de CORS), execute o projeto através de um servidor local:
```bash
   npm run dev
```

4. Acesse `http://localhost:5173/` no navegador.

Também é possível usar a extensão "Live Server" do VS Code ou outro servidor estático, como:
```bash
   npx serve .
```

## Organização das Pastas

```text
.
├── index.html              # Entrada principal da aplicação
├── public/
│   └── models/             # Modelos 3D, texturas, .bin e licenças
└── src/
    ├── 3d/                 # Cena, viewer, luzes e interações Three.js
    ├── data/               # Dados dos produtos
    ├── demo/               # Demonstrações isoladas
    ├── ui/
    │   ├── components/     # Navbar, footer e cards
    │   ├── pages/          # Home, catálogo, produto e 404
    │   └── styles.css      # Estilos da interface
    ├── utils/              # Funções auxiliares de DOM e navegação
    └── app.js              # Inicialização e roteamento
```

## Licença

Projeto acadêmico sem fins comerciais — UFC, 2026.

## Imagens

<img src="./images/Captura de tela de 2026-05-20 12-35-12.png">
<img src="./images/Captura de tela de 2026-05-20 12-41-10.png">
<img src="./images/Captura de tela de 2026-05-20 12-41-29.png">
