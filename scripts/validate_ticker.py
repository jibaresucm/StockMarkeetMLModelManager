import sys
import json
import io
import contextlib
from Datasets import checkForStock

ticker = sys.argv[1] if len(sys.argv) > 1 else ""
ticker = ''.join(c for c in ticker if c.isalnum() or c in '.^-')[:10]

try:
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        valid = checkForStock(ticker)
    print(json.dumps({"valid": bool(valid)}))
except Exception as e:
    print("validate_ticker error: " + str(e), file=sys.stderr)
    print(json.dumps({"valid": False}))
