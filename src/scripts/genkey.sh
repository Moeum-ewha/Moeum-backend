#!/bin/bash

# Generate private key (ES256)
openssl ecparam -name prime256v1 -genkey -noout -out private.ec.key

