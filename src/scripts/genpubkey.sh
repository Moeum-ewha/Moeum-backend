#!/bin/bash

# Generate public key
openssl ec -in private.ec.key -pubout -out public.ec.pem
