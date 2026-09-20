const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const {name,email,project,message}=req.body||{};
  if(!name||!email||!project||!message) return res.status(400).json({error:'Champs manquants'});
  if(!process.env.RESEND_API_KEY) return res.status(500).json({error:'Configuration email manquante'});
  const safeEmail=esc(email);
  const mailtoEmail=encodeURIComponent(String(email));
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({
    from:'COMRAPIDE <site@comrapide.fr>',
    to:['contact@comrapide.fr'],
    reply_to:String(email),
    subject:'Nouvelle demande de devis — '+String(project),
    html:`<!doctype html>
<html lang="fr">
<body style="margin:0;padding:0;background:#f3f4f4;font-family:Arial,Helvetica,sans-serif;color:#202323;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f4f4;padding:20px 10px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr><td style="background:#202323;padding:28px 24px;text-align:center;">
          <div style="font-size:30px;font-weight:800;letter-spacing:1px;color:#b8f000;">COMRAPIDE</div>
          <div style="margin-top:6px;font-size:13px;color:#ffffff;">Impression • Signalétique • Marquage</div>
        </td></tr>
        <tr><td style="padding:28px 24px;">
          <div style="font-size:12px;font-weight:700;letter-spacing:1.4px;color:#6b6f70;">NOUVELLE DEMANDE</div>
          <h1 style="margin:6px 0 24px;font-size:25px;line-height:1.2;color:#202323;">Demande de devis</h1>

          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr><td style="padding:13px 15px;background:#f6f7f7;border-radius:10px;">
              <div style="font-size:12px;color:#777;">Nom / Société</div>
              <div style="margin-top:4px;font-size:16px;font-weight:700;">${esc(name)}</div>
            </td></tr>
            <tr><td height="10"></td></tr>
            <tr><td style="padding:13px 15px;background:#f6f7f7;border-radius:10px;">
              <div style="font-size:12px;color:#777;">E-mail</div>
              <div style="margin-top:4px;font-size:16px;"><a href="mailto:${safeEmail}" style="color:#202323;text-decoration:none;">${safeEmail}</a></div>
            </td></tr>
            <tr><td height="10"></td></tr>
            <tr><td style="padding:13px 15px;background:#f6f7f7;border-radius:10px;">
              <div style="font-size:12px;color:#777;">Projet</div>
              <div style="margin-top:4px;font-size:16px;font-weight:700;">${esc(project)}</div>
            </td></tr>
            <tr><td height="10"></td></tr>
            <tr><td style="padding:13px 15px;background:#f6f7f7;border-radius:10px;">
              <div style="font-size:12px;color:#777;">Message</div>
              <div style="margin-top:7px;font-size:16px;line-height:1.55;">${esc(message).replace(/\n/g,'<br>')}</div>
            </td></tr>
          </table>

          <div style="text-align:center;margin:26px 0 8px;">
            <a href="mailto:${mailtoEmail}" style="display:inline-block;background:#b8f000;color:#171919;text-decoration:none;font-size:15px;font-weight:800;padding:15px 24px;border-radius:10px;">RÉPONDRE AU CLIENT</a>
          </div>
        </td></tr>
        <tr><td style="background:#202323;padding:22px 24px;text-align:center;color:#ffffff;">
          <div style="font-size:18px;font-weight:800;color:#b8f000;">COMRAPIDE</div>
          <div style="margin-top:9px;font-size:13px;line-height:1.8;">
            <a href="tel:+33652593538" style="color:#ffffff;text-decoration:none;">06 52 59 35 38</a><br>
            <a href="mailto:contact@comrapide.fr" style="color:#ffffff;text-decoration:none;">contact@comrapide.fr</a><br>
            <a href="https://www.comrapide.fr" style="color:#ffffff;text-decoration:none;">www.comrapide.fr</a>
          </div>
          <div style="margin-top:14px;font-size:11px;color:#aeb2b2;">Demande envoyée depuis le formulaire comrapide.fr</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
  })});
  const data=await response.json();
  if(!response.ok) return res.status(response.status).json({error:'Envoi impossible',details:data});
  return res.status(200).json({ok:true,id:data.id});
}
