import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'http://84.234.28.117:8000/',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzQzNDU4NDAwLAogICJleHAiOiAxOTAxMjI0ODAwCn0.hHSgGnRUrYwbK_iFxUmTfAhPMW_7OeoE4Pug86nM1uE',
)
