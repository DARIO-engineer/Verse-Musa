# 🤝 Guia de Contribuição - Verse-Musa

Primeiramente, obrigado por considerar contribuir com o Verse-Musa! É pessoas como você que fazem deste projeto uma bênção para a comunidade cristã de escritores.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Posso Contribuir?](#como-posso-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Diretrizes de Estilo](#diretrizes-de-estilo)
- [Processo de Pull Request](#processo-de-pull-request)
- [Comunidade](#comunidade)

---

## 📜 Código de Conduta

Este projeto e todos os participantes são regidos pelo nosso [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você está concordando em manter este código. Por favor, reporte comportamentos inaceitáveis.

---

## 🎯 Como Posso Contribuir?

### 🐛 Reportando Bugs

Antes de criar um relatório de bug, verifique se o problema já não foi reportado. Se encontrar um bug:

1. **Use o template de issue de bug** quando disponível
2. **Seja claro e descritivo** no título
3. **Descreva os passos exatos** para reproduzir o problema
4. **Forneça exemplos específicos** sempre que possível
5. **Descreva o comportamento observado** e o comportamento esperado
6. **Inclua capturas de tela** se aplicável
7. **Inclua detalhes do ambiente**: SO, versão do navegador, etc.

### 💡 Sugerindo Melhorias

Melhorias são sempre bem-vindas! Para sugerir uma melhoria:

1. **Use o template de feature request** quando disponível
2. **Explique claramente** qual problema a feature resolve
3. **Descreva a solução** que você imagina
4. **Considere alternativas** que você pensou
5. **Explique por que** isso seria útil para a maioria dos usuários

### 📝 Contribuindo com Código

#### Seu Primeiro Código?

Não tem problema! Procure por issues marcadas como:
- `good first issue` - Boas para iniciantes
- `help wanted` - Precisamos de ajuda aqui

#### Processo de Desenvolvimento Local

1. **Fork o repositório**
   ```bash
   # Clique no botão "Fork" no GitHub
   ```

2. **Clone seu fork**
   ```bash
   git clone https://github.com/seu-usuario/Verse-Musa.git
   cd Verse-Musa
   ```

3. **Configure o upstream**
   ```bash
   git remote add upstream https://github.com/DARIO-engineer/Verse-Musa.git
   ```

4. **Crie uma branch**
   ```bash
   git checkout -b feature/minha-nova-feature
   # ou
   git checkout -b fix/correcao-de-bug
   ```

5. **Faça suas alterações**
   - Escreva código limpo e legível
   - Adicione testes quando apropriado
   - Atualize a documentação se necessário

6. **Commit suas mudanças**
   ```bash
   git add .
   git commit -m "feat: adiciona nova funcionalidade X"
   ```

7. **Mantenha seu fork atualizado**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

8. **Push para seu fork**
   ```bash
   git push origin feature/minha-nova-feature
   ```

9. **Abra um Pull Request**

---

## 🎨 Diretrizes de Estilo

### Mensagens de Commit

Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```
tipo(escopo): descrição curta

[corpo opcional]

[rodapé opcional]
```

**Tipos comuns:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças na documentação
- `style`: Formatação, ponto e vírgula faltando, etc
- `refactor`: Refatoração de código
- `test`: Adição de testes
- `chore`: Manutenção

**Exemplos:**
```bash
feat: adiciona editor de texto rico
fix: corrige salvamento automático
docs: atualiza README com novas instruções
style: formata código seguindo o padrão
refactor: reorganiza estrutura de pastas
test: adiciona testes para o componente Editor
chore: atualiza dependências
```

### Código

- **Nomes significativos**: Use nomes claros e descritivos
- **Comentários**: Comente apenas o "por quê", não o "como"
- **Funções pequenas**: Cada função deve fazer uma coisa bem feita
- **DRY**: Don't Repeat Yourself - não repita código
- **Testes**: Escreva testes para código crítico

### Documentação

- Use português claro e direto
- Inclua exemplos quando possível
- Mantenha a documentação atualizada com o código
- Use markdown para formatação

---

## 🔄 Processo de Pull Request

1. **Preencha o template** de PR completamente
2. **Atualize a documentação** se necessário
3. **Adicione testes** para novas funcionalidades
4. **Certifique-se** de que todos os testes passam
5. **Siga as diretrizes** de estilo
6. **Vincule issues** relacionadas
7. **Aguarde review**: um mantenedor revisará seu PR
8. **Faça as alterações** solicitadas, se houver
9. **Celebre**: Sua contribuição será merged! 🎉

### Checklist do Pull Request

- [ ] Meu código segue as diretrizes de estilo
- [ ] Revisei meu próprio código
- [ ] Comentei áreas complexas quando necessário
- [ ] Atualizei a documentação
- [ ] Minhas mudanças não geram novos warnings
- [ ] Adicionei testes que provam que minha correção funciona
- [ ] Testes novos e existentes passam localmente
- [ ] Mudanças dependentes foram merged e publicadas

---

## 🛠️ Configuração do Ambiente de Desenvolvimento

*Instruções detalhadas serão adicionadas conforme o projeto evolui.*

---

## ✅ Executando Testes

*Instruções de teste serão adicionadas conforme o projeto evolui.*

```bash
# Exemplos futuros
# npm test
# npm run test:watch
# npm run test:coverage
```

---

## 📚 Recursos Adicionais

- [Documentação do Projeto](docs/)
- [Arquitetura do Sistema](docs/ARCHITECTURE.md) *(em breve)*
- [Guia de Estilo](docs/STYLE_GUIDE.md) *(em breve)*

---

## 💬 Comunidade

- **GitHub Issues**: Para bugs e features
- **GitHub Discussions**: Para perguntas e discussões
- **Pull Requests**: Para contribuições de código

---

## 🙏 Reconhecimentos

Agradecemos a todos os contribuidores que ajudam a tornar este projeto uma bênção:

<!-- Lista de contribuidores será gerada automaticamente -->

---

## ❓ Dúvidas?

Se você tiver dúvidas sobre como contribuir:

1. Verifique a documentação existente
2. Procure em issues fechadas
3. Abra uma [Discussion](https://github.com/DARIO-engineer/Verse-Musa/discussions)
4. Abra uma issue com a tag `question`

---

<div align="center">

**Obrigado por contribuir com o Verse-Musa!**

*"Tudo quanto te vier à mão para fazer, faze-o conforme as tuas forças."* - Eclesiastes 9:10

</div>
