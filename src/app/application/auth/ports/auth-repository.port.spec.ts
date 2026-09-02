import { describe, it, expect } from 'vitest';
import { RegisterInput } from './auth-repository.port';

const validParams = { name: 'Sergio', email: 'sergio@email.com', password: 'Senha@123' };

describe('RegisterInput', () => {
  it('aceita senha com exatamente 8 caracteres cumprindo os requisitos (limite mínimo válido)', () => {
    const input = new RegisterInput({ ...validParams, password: 'Aa1!aaaa' });
    expect(input.password).toBe('Aa1!aaaa');
  });

  it('rejeita senha com 7 caracteres mesmo cumprindo os demais requisitos (um abaixo do limite)', () => {
    expect(() => new RegisterInput({ ...validParams, password: 'Aa1!aaa' })).toThrow();
  });

  it('rejeita senha sem letra maiúscula', () => {
    expect(() => new RegisterInput({ ...validParams, password: 'aa1!aaaa' })).toThrow();
  });

  it('rejeita senha sem número', () => {
    expect(() => new RegisterInput({ ...validParams, password: 'Aaa!aaaa' })).toThrow();
  });

  it('rejeita senha sem caractere especial', () => {
    expect(() => new RegisterInput({ ...validParams, password: 'Aa1aaaaa' })).toThrow();
  });

  it('rejeita nome vazio ou só com espaços', () => {
    expect(() => new RegisterInput({ ...validParams, name: '   ' })).toThrow();
  });

  it('remove espaços nas bordas do nome e do e-mail', () => {
    const input = new RegisterInput({
      ...validParams,
      name: '  Sergio  ',
      email: '  sergio@email.com  ',
    });
    expect(input.name).toBe('Sergio');
    expect(input.email).toBe('sergio@email.com');
  });

  it('rejeita e-mail sem @', () => {
    expect(() => new RegisterInput({ ...validParams, email: 'sergioemail.com' })).toThrow();
  });

  it('rejeita e-mail sem ponto no domínio', () => {
    expect(() => new RegisterInput({ ...validParams, email: 'sergio@email' })).toThrow();
  });

  it('aceita e-mail no formato mínimo válido (limite: 1 caractere antes/depois do @, 1 ponto no domínio)', () => {
    const input = new RegisterInput({ ...validParams, email: 'a@b.co' });
    expect(input.email).toBe('a@b.co');
  });
});
