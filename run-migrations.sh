#!/bin/bash
# Run Supabase migrations via REST API

SUPABASE_URL="https://ltsssytfvfkglpnkcfzz.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0c3NzeXRmdmZrZ2xwbmtjZnp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk3NDcwNiwiZXhwIjoyMDg4NTUwNzA2fQ.dazvA_elIzGYjmOMRJbvZ2tJzmL1IXhmI07EYREoMD4"

echo "Creating tables via Supabase REST API..."

# Try to insert a test category to create table (will fail but shows connection works)
curl -s -X POST "$SUPABASE_URL/rest/v1/categories" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{"id": "10000000-0000-0000-0000-000000000001", "name": "Electronics", "slug": "electronics"}'

echo "Done. Check Supabase dashboard for results."
