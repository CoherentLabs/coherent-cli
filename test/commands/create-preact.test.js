const {expect, test} = require('@oclif/test')

describe('create-preact', () => {
  test
  .stdout()
  .command(['create-preact'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['create-preact', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
