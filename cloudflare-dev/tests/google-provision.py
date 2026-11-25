import contextlib
import importlib.util
import io
import json
import pathlib
import subprocess
import unittest

spec = importlib.util.spec_from_file_location('google_provision', pathlib.Path(__file__).resolve().parents[1] / 'provision-google.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ProvisionTests(unittest.TestCase):
    def test_missing_credentials_preserve_existing_secrets(self):
        module.provision({}, lambda *a, **kw: self.fail('must not upload without credentials'))
        module.provision({}, lambda *a, **kw: self.fail('must preserve directly configured Worker secret'), public_client_id='123-public.apps.googleusercontent.com')

    def test_partial_credentials_never_write(self):
        for env in [{'GOOGLE_CLIENT_ID': 'public'}, {'GOOGLE_CLIENT_SECRET': 'sensitive-fixture'}]:
            with self.assertRaises(ValueError):
                module.provision(env, lambda *a, **kw: self.fail('partial pair must not upload'))

    def test_pair_uses_stdin_and_never_logs_values_or_provider_output(self):
        env = {'GOOGLE_CLIENT_ID': '123-unit-test.apps.googleusercontent.com', 'GOOGLE_CLIENT_SECRET': 'sensitive-fixture'}
        def run(args, **kw):
            self.assertNotIn(env['GOOGLE_CLIENT_SECRET'], ' '.join(args))
            self.assertEqual(json.loads(kw['input']), env)
            self.assertTrue(kw['capture_output'])
            return subprocess.CompletedProcess(args, 0, stdout='provider-echo-sensitive-fixture')
        out = io.StringIO()
        with contextlib.redirect_stdout(out):
            module.provision(env, run)
        self.assertNotIn(env['GOOGLE_CLIENT_ID'], out.getvalue())
        self.assertNotIn(env['GOOGLE_CLIENT_SECRET'], out.getvalue())
        with contextlib.redirect_stdout(io.StringIO()):
            module.provision({'GOOGLE_CLIENT_SECRET': env['GOOGLE_CLIENT_SECRET']}, lambda *a, **kw: subprocess.CompletedProcess(a, 0), public_client_id=env['GOOGLE_CLIENT_ID'])
        with self.assertRaises(RuntimeError):
            module.provision(env, lambda *a, **kw: subprocess.CompletedProcess(a, 1, stderr='sensitive-fixture'))


unittest.main()
