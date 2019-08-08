/*
Sourced from: https://github.com/dakshshah96/local-cert-generator

https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/


This generates rootCA.key file:

Developers-iMac:experiment-nodejs-https dev$ openssl genrsa -des3 -out rootCA.key 2048
Generating RSA private key, 2048 bit long modulus
............................................................................................................+++
...................................+++
e is 65537 (0x10001)
Enter pass phrase for rootCA.key:
Verifying - Enter pass phrase for rootCA.key:
Developers-iMac:experiment-nodejs-https dev$ ls -la
total 768
drwxrwxrwx  1 dev  staff  131072 Jul  6 18:25 .
drwxrwxrwx  1 dev  staff  131072 May 30 08:47 ..
-rwxrwxrwx  1 dev  staff    1751 Jul  6 18:30 rootCA.key


This generates rootCA.pem file:

Developers-iMac:experiment-nodejs-https dev$ openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem
Enter pass phrase for rootCA.key:
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) []:PH
State or Province Name (full name) []:
Locality Name (eg, city) []:
Organization Name (eg, company) []:
Organizational Unit Name (eg, section) []:
Common Name (eg, fully qualified host name) []:
Email Address []:
Developers-iMac:experiment-nodejs-https dev$ ls -la
total 1024
drwxrwxrwx  1 dev  staff  131072 Jul  6 18:25 .
drwxrwxrwx  1 dev  staff  131072 May 30 08:47 ..
-rwxrwxrwx  1 dev  staff    1751 Jul  6 18:30 rootCA.key
-rwxrwxrwx  1 dev  staff     956 Jul  6 18:31 rootCA.pem



Create server.csr.cnf with this content:

[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn

[dn]
C=PH
ST=RandomState
L=RandomCity
O=RandomOrganization
OU=RandomOrganizationUnit
emailAddress=hello@example.com
CN = localhost

Create v3.ext with this content:

authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost



Developers-iMac:experiment-nodejs-https dev$ ls -la
total 1536
drwxrwxrwx  1 dev  staff  131072 Jul  6 18:25 .
drwxrwxrwx  1 dev  staff  131072 May 30 08:47 ..
-rwxrwxrwx  1 dev  staff    1751 Jul  6 18:30 rootCA.key
-rwxrwxrwx  1 dev  staff     956 Jul  6 18:31 rootCA.pem
-rwxrwxrwx  1 dev  staff     214 Jul  6 18:33 server.csr.cnf
-rwxrwxrwx  1 dev  staff     200 Jul  6 18:34 v3.ext




This generates server.csr and server.key files:

Developers-iMac:experiment-nodejs-https dev$ openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config server.csr.cnf
Generating a 2048 bit RSA private key
.........................................+++
...............+++
writing new private key to 'server.key'
-----
Developers-iMac:experiment-nodejs-https dev$ ls -la
total 2048
drwxrwxrwx  1 dev  staff  131072 Jul  6 18:25 .
drwxrwxrwx  1 dev  staff  131072 May 30 08:47 ..
-rwxrwxrwx  1 dev  staff    1751 Jul  6 18:30 rootCA.key
-rwxrwxrwx  1 dev  staff     956 Jul  6 18:31 rootCA.pem
-rwxrwxrwx  1 dev  staff    1098 Jul  6 18:35 server.csr
-rwxrwxrwx  1 dev  staff     214 Jul  6 18:33 server.csr.cnf
-rwxrwxrwx  1 dev  staff    1704 Jul  6 18:35 server.key
-rwxrwxrwx  1 dev  staff     200 Jul  6 18:34 v3.ext


This generates rootCA.srl and server.crt files:

Developers-iMac:experiment-nodejs-https dev$ openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext
Signature ok
subject=/C=PH/ST=RandomState/L=RandomCity/O=RandomOrganization/OU=RandomOrganizationUnit/emailAddress=hello@example.com/CN=localhost
Getting CA Private Key
Enter pass phrase for rootCA.key:
Developers-iMac:experiment-nodejs-https dev$ ls -la
total 2560
drwxrwxrwx  1 dev  staff  131072 Jul  6 18:25 .
drwxrwxrwx  1 dev  staff  131072 May 30 08:47 ..
-rwxrwxrwx  1 dev  staff    1751 Jul  6 18:30 rootCA.key
-rwxrwxrwx  1 dev  staff     956 Jul  6 18:31 rootCA.pem
-rwxrwxrwx  1 dev  staff      17 Jul  6 18:36 rootCA.srl
-rwxrwxrwx  1 dev  staff    1306 Jul  6 18:36 server.crt
-rwxrwxrwx  1 dev  staff    1098 Jul  6 18:35 server.csr
-rwxrwxrwx  1 dev  staff     214 Jul  6 18:33 server.csr.cnf
-rwxrwxrwx  1 dev  staff    1704 Jul  6 18:35 server.key
-rwxrwxrwx  1 dev  staff     200 Jul  6 18:34 v3.ext

*/

var fs = require("fs");
var express = require("express");
var https = require("https");

var certOptions = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.crt")
};

var app = express();

app.get("/message", (req, res) => {
    res.json({ message: "Great" });
});

var server = https.createServer(certOptions, app).listen(443);

console.log("server ready");
