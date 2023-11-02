#!/bin/bash

# Generate public key
openssl ec -in private.refresh.ec.key -pubout -out public.refresh.ec.pem
