const {expect, test} = require('@oclif/test')

describe('create-mock-model', () => {
  test
  .stdout()
  .command(['create-mock-model'])
  .it('runs hello', ctx => {
    expect(ctx.stdout).to.contain('hello world')
  })

  test
  .stdout()
  .command(['create-mock-model', '--name', 'jeff'])
  .it('runs hello --name jeff', ctx => {
    expect(ctx.stdout).to.contain('hello jeff')
  })
})
