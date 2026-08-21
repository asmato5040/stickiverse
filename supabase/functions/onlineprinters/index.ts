import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ONLINEPRINTERS_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ONLINEPRINTERS_API_KEY is not set in Supabase secrets.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    // ── 1. PREISANFRAGE ──────────────────────────────────
    if (action === 'pricing') {
      if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { country, articleDeepLink, mode, product_id } = await req.json();
      if (!articleDeepLink) {
        return new Response(JSON.stringify({ error: 'articleDeepLink is required.' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const countryCode = country || 'DEU'; // Default DEU

      const opUrl = `https://api.onlineprinters.io/api/v2/pricing?country=${countryCode}&articleDeepLink=${encodeURIComponent(articleDeepLink)}`;

      const response = await fetch(opUrl, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && mode === 'storefront') {
        let margin = 1.10; // Fallback
        try {
          const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
          const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
          const supabase = createClient(supabaseUrl, supabaseKey);

          const { data: settingData, error: settingError } = await supabase
            .from('store_settings')
            .select('id, value')
            .in('id', ['product_margins', 'pricing_margin']);
            
          if (!settingError && settingData) {
            const productMargins = settingData.find(s => s.id === 'product_margins')?.value;
            if (productMargins && typeof productMargins === 'object' && product_id && productMargins[product_id]) {
              margin = parseFloat(productMargins[product_id]);
            } else {
              const globalMargin = settingData.find(s => s.id === 'pricing_margin')?.value;
              if (globalMargin) margin = parseFloat(globalMargin);
            }
          }
        } catch (e) {
          console.error("Error fetching margin:", e);
        }

        const originalGross = parseFloat(data?.total?.total?.amount || '0');
        const originalNet = parseFloat(data?.total?.net?.amount || '0');

        return new Response(JSON.stringify({
          storefront_price: true,
          final_gross: originalGross * margin,
          final_net: originalNet * margin,
          currency: data?.total?.total?.currency || 'EUR'
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Normales Verhalten (für Admin Panel / Original API Response)
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ── 2. BESTELLUNG ÜBERMITTELN ──────────────────────────
    if (action === 'order') {
      if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { jobData, printFiles } = await req.json();
      
      // 1. Create the job at Onlineprinters
      const response = await fetch('https://api.onlineprinters.io/api/v2/jobs', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      const data = await response.json();
      
      if (!response.ok) {
         // Return immediately if job creation fails
         return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
         });
      }

      // 2. Upload print files
      // If job creation is successful, OP should return an orderNumber in data.orderNumber
      const orderNumber = data.orderNumber || jobData.customerReference; 
      const uploadResults = [];

      if (printFiles && printFiles.length > 0) {
        for (const file of printFiles) {
          try {
            let fileBlob;
            if (file.url.startsWith('data:')) {
              // Extract base64 string
              const arr = file.url.split(',');
              const bstr = atob(arr[1]);
              let n = bstr.length;
              const u8arr = new Uint8Array(n);
              while(n--) {
                u8arr[n] = bstr.charCodeAt(n);
              }
              const mimeMatch = arr[0].match(/:(.*?);/);
              const mime = mimeMatch ? mimeMatch[1] : 'image/png';
              fileBlob = new Blob([u8arr], {type: mime});
            } else {
              // Fetch the file from our own Supabase Storage URL
              const fileResp = await fetch(file.url);
              fileBlob = await fileResp.blob();
            }

            const formData = new FormData();
            formData.append('file', fileBlob, file.filename || 'print_file.png');

            const uploadResp = await fetch(`https://api.onlineprinters.io/api/v2/upload/${orderNumber}`, {
              method: 'POST',
              headers: {
                'x-api-key': apiKey,
                'Accept': 'application/json'
              },
              body: formData
            });

            const uploadData = await uploadResp.json();
            uploadResults.push({ file: file.filename, status: uploadResp.status, data: uploadData });
          } catch (e) {
            uploadResults.push({ file: file.filename, error: e.message });
          }
        }
      }

      return new Response(JSON.stringify({ job: data, uploads: uploadResults }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Action not found. Use /pricing or /order.' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
