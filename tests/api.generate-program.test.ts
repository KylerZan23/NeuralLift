import Ajv from 'ajv';
import programSchema from '@/types/program.schema.json';

describe('POST /api/generate-program (schema failure)', () => {
  it('returns 400 for invalid program payload (unit-level ajv simulation)', () => {
    const ajv = new Ajv({ allErrors: true, strict: false });
    const validate = ajv.compile(programSchema as any);
    const invalid = { name: 'bad' } as any;
    const ok = validate(invalid);
    expect(ok).toBe(false);
    expect(validate.errors?.length).toBeGreaterThan(0);
  });
});


