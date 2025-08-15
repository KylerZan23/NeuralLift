import programSchema from '@/types/program.schema.json';
import Ajv from 'ajv';

describe('Program schema validation', () => {
  it('fails when required fields are missing', () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(programSchema as any);
    const bad = { name: 'Missing fields' } as any;
    const valid = validate(bad);
    expect(valid).toBe(false);
    expect(validate.errors?.length).toBeGreaterThan(0);
  });
});


