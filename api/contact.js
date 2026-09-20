const esc=(s='')=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const {name,email,project,message}=req.body||{};
  if(!name||!email||!project||!message) return res.status(400).json({error:'Champs manquants'});
  if(!process.env.RESEND_API_KEY) return res.status(500).json({error:'Configuration email manquante'});
  const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({
    from:'COMRAPIDE Site <site@comrapide.fr>',
    to:['contact@comrapide.fr'],
    reply_to:String(email),
    subject:'Nouvelle demande de devis — '+String(project),
    html:`<h2>Nouvelle demande de devis</h2><p><strong>Nom / Société :</strong> ${esc(name)}</p><p><strong>E-mail :</strong> ${esc(email)}</p><p><strong>Projet :</strong> ${esc(project)}</p><p><strong>Message :</strong><br>${esc(message).replace(/\n/g,'<br>')}</p>`
  })});
  const data=await response.json();
  if(!response.ok) return res.status(response.status).json({error:'Envoi impossible',details:data});
  return res.status(200).json({ok:true,id:data.id});
}
