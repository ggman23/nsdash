from flask import Flask, request, Response, send_from_directory
import requests, os

ROOT = "/var/www/nsdash"
UPSTREAM = "http://127.0.0.1:1337"

app = Flask(__name__, static_folder=None)

# Pages
@app.route("/prod/")
def prod():
    return send_from_directory(os.path.join(ROOT, "prod"), "index.html")

@app.route("/test/")
def test():
    return send_from_directory(os.path.join(ROOT, "test"), "index.html")

# Assets locaux (Chart.js, adapter, etc.)
@app.route("/vendor/<path:fn>")
def vendor(fn):
    return send_from_directory(os.path.join(ROOT, "vendor"), fn)

# Fichiers statiques éventuels
@app.route("/prod/<path:fn>")
def prod_files(fn):
    return send_from_directory(os.path.join(ROOT, "prod"), fn)

@app.route("/test/<path:fn>")
def test_files(fn):
    return send_from_directory(os.path.join(ROOT, "test"), fn)

# Proxy Nightscout (désactive la compression côté amont)
@app.route("/ns/<path:path>", methods=["GET","POST","PUT","PATCH","DELETE"])
def ns_proxy(path):
    url = f"{UPSTREAM}/{path}"
    # On enlève les en-têtes qui posent soucis et on force Accept-Encoding: identity
    fwd_headers = {k: v for k, v in request.headers if k.lower() not in (
        "host","content-length","accept-encoding","connection"
    )}
    fwd_headers["Accept-Encoding"] = "identity"

    resp = requests.request(
        method=request.method,
        url=url,
        params=request.args,
        data=request.get_data(),
        headers=fwd_headers,
        allow_redirects=False,
        timeout=20,
    )

    # On retire encodage/longueur/transfert: on renvoie le corps "tel quel" (décompressé)
    hop_by_hop = {"content-encoding","transfer-encoding","content-length","connection"}
    out_headers = [(k, v) for k, v in resp.headers.items() if k.lower() not in hop_by_hop]

    return Response(resp.content, status=resp.status_code, headers=out_headers)

@app.route("/")
def root():
    return Response("NS Dash is running", mimetype="text/plain")

if __name__ == "__main__":
    # écoute sur 0.0.0.0:8099
    app.run(host="0.0.0.0", port=8099)
