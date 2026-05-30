/**
 * Generates a pixel-perfect clone of the WordPress login page (WP 6.7.2).
 * Form submission is intercepted on the client side, causing a 5-15s delay
 * and throwing randomized realistic error messages.
 */
export function wpLoginPage(host: string): string {
  return `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex,nofollow">
<title>Log In &lsaquo; ${host} &#8212; WordPress</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f1f1f1;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif;font-size:13px;color:#3c434a}
.login{width:320px;margin:0 auto;padding:8% 0 0}
.login h1{text-align:center;margin-bottom:24px}
.login h1 a{font-size:0;display:inline-block;width:84px;height:84px;background:url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><circle cx="200" cy="200" r="180" fill="%232271b1"/><text x="200" y="240" font-family="sans-serif" font-size="200" fill="white" text-anchor="middle">W</text></svg>') no-repeat center;background-size:84px}
#loginform{background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:26px 24px;box-shadow:0 1px 3px rgba(0,0,0,.04)}
.login-title{font-size:20px;font-weight:400;margin-bottom:16px;text-align:center}
label{display:block;margin-bottom:3px;font-weight:600;font-size:14px}
input[type=text],input[type=password]{width:100%;padding:4px 8px;font-size:24px;border:1px solid #8c8f94;border-radius:4px;margin-bottom:16px;line-height:1.3}
input[type=text]:focus,input[type=password]:focus{border-color:#2271b1;box-shadow:0 0 0 1px #2271b1;outline:none}
.forgetmenot{margin-bottom:16px}
.forgetmenot label{font-weight:400;font-size:13px;display:flex;align-items:center;gap:6px}
#wp-submit{background:#2271b1;border:1px solid #2271b1;color:#fff;padding:0 12px;font-size:13px;line-height:2.15;min-height:36px;border-radius:3px;cursor:pointer;width:100%;font-weight:600}
#wp-submit:hover{background:#135e96}
.login #nav{margin:16px 0;text-align:center}
.login #nav a{color:#50575e;font-size:13px}
.login #nav a:hover{color:#2271b1}
#login_error{background:#fcf0f1;border:1px solid #d63638;border-left-width:4px;border-radius:4px;padding:12px;margin-bottom:16px;color:#d63638;display:none}
.spinner{display:none;margin:12px auto;width:24px;height:24px;border:3px solid #c3c4c7;border-top-color:#2271b1;border-radius:50%;animation:spin .6s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
#login_error.show,.spinner.show{display:block}
</style>
</head>
<body class="login">
<div class="login">
<h1><a href="https://wordpress.org/" title="Powered by WordPress"></a></h1>
<div id="login_error"></div>
<form name="loginform" id="loginform" method="post">
<p><label for="user_login">Username or Email Address</label>
<input type="text" name="log" id="user_login" autocomplete="username" value="" size="20" autocapitalize="off" autofocus></p>
<p><label for="user_pass">Password</label>
<input type="password" name="pwd" id="user_pass" autocomplete="current-password" value="" size="20"></p>
<p class="forgetmenot"><label><input name="rememberme" type="checkbox" id="rememberme" value="forever"> Remember Me</label></p>
<div class="spinner" id="spinner"></div>
<p class="submit"><input type="submit" name="wp-submit" id="wp-submit" value="Log In"></p>
</form>
<p id="nav"><a href="/wp-login.php?action=lostpassword">Lost your password?</a></p>
</div>
<script>
document.getElementById('loginform').addEventListener('submit', function(e) {
  e.preventDefault();
  var s = document.getElementById('spinner');
  var err = document.getElementById('login_error');
  var btn = document.getElementById('wp-submit');
  s.className = 'spinner show';
  btn.disabled = true;
  btn.value = 'Verifying...';
  err.style.display = 'none';
  var data = new FormData(this);
  fetch('/wp-admin/admin-ajax.php', {
    method: 'POST',
    body: JSON.stringify({u: data.get('log'), p: data.get('pwd'), t: Date.now()}),
    headers: {'Content-Type': 'application/json'}
  }).catch(function(){});
  setTimeout(function() {
    s.className = 'spinner';
    btn.disabled = false;
    btn.value = 'Log In';
    err.style.display = 'block';
    err.className = 'login_error show';
    var msgs = [
      '<strong>Error:</strong> The password you entered for the username <strong>' + (data.get('log') || 'admin') + '</strong> is incorrect. <a href="/wp-login.php?action=lostpassword">Lost your password?</a>',
      '<strong>Error:</strong> Unknown username. Check again or try your email address.',
      '<strong>Error:</strong> The username <strong>' + (data.get('log') || '') + '</strong> is not registered on this site. If you are unsure of your username, try your email address instead.',
    ];
    err.innerHTML = msgs[Math.floor(Math.random() * msgs.length)];
  }, 5000 + Math.random() * 10000);
});
</script>
</body>
</html>`;
}

/**
 * Generates an infinite maze of fake WordPress admin dashboard pages.
 */
export function wpAdminPage(path: string, host: string): string {
  const pages = [
    "edit.php", "post-new.php", "upload.php", "edit-comments.php",
    "themes.php", "plugins.php", "users.php", "tools.php",
    "options-general.php", "update-core.php", "profile.php",
    "edit-tags.php?taxonomy=category", "edit-tags.php?taxonomy=post_tag",
    "widgets.php", "nav-menus.php", "customize.php", "export.php",
    "import.php", "site-health.php", "privacy.php",
  ];
  const current = path.replace("/wp-admin/", "").replace("/wp-admin", "") || "index.php";
  const menu = pages.map((p) => {
    const label = p.replace(".php", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const isActive = current === p;
    return `<li><a href="/wp-admin/${p}" style="color:#f0f0f1;text-decoration:none;display:block;padding:5px 12px;${
      isActive ? "background:#2271b1;font-weight:600;" : ""
    }font-size:13px">${label}</a></li>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Dashboard &lsaquo; ${host} &#8212; WordPress</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;font-size:13px;color:#3c434a;background:#f0f0f1}
#adminmenu{background:#1d2327;width:160px;position:fixed;left:0;top:0;bottom:0;overflow-y:auto;z-index:99}
#adminmenu ul{list-style:none}#adminmenu h2{color:#fff;padding:14px 12px;font-size:14px;border-bottom:1px solid #2c3338}
#wpcontent{margin-left:160px;padding:20px}
.wrap h1{font-size:23px;font-weight:400;margin-bottom:15px;color:#1d2327}
.notice{background:#fff;border:1px solid #c3c4c7;border-left:4px solid #2271b1;padding:12px;margin-bottom:20px;border-radius:2px}
.card{background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:20px;margin-bottom:20px}
.card h2{font-size:14px;margin-bottom:10px}.card p{color:#646970;line-height:1.6}.card a{color:#2271b1}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:15px;margin-bottom:20px}
.stat{background:#fff;border:1px solid #c3c4c7;border-radius:4px;padding:15px;text-align:center}
.stat .num{font-size:28px;font-weight:600;color:#2271b1}.stat .label{font-size:12px;color:#646970;margin-top:4px}
table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #c3c4c7;border-radius:4px}
th{background:#f6f7f7;text-align:left;padding:8px 10px;font-size:12px;border-bottom:1px solid #c3c4c7}
td{padding:8px 10px;border-bottom:1px solid #f0f0f1;font-size:13px}td a{color:#2271b1;text-decoration:none}
@media(max-width:768px){#adminmenu{display:none}#wpcontent{margin-left:0}.stats{grid-template-columns:repeat(2,1fr)}}
</style></head>
<body>
<div id="adminmenu"><h2>Dashboard</h2><ul>${menu}</ul></div>
<div id="wpcontent"><div class="wrap">
<h1>Dashboard</h1>
<div class="notice"><p>WordPress 6.7.2 is available! <a href="/wp-admin/update-core.php">Please update now</a>.</p></div>
<div class="stats">
<div class="stat"><div class="num">${47 + Math.floor(Math.random() * 200)}</div><div class="label">Posts</div></div>
<div class="stat"><div class="num">${12 + Math.floor(Math.random() * 50)}</div><div class="label">Pages</div></div>
<div class="stat"><div class="num">${120 + Math.floor(Math.random() * 500)}</div><div class="label">Comments</div></div>
<div class="stat"><div class="num">${3 + Math.floor(Math.random() * 10)}</div><div class="label">Plugins</div></div>
</div>
<div class="card"><h2>Recent Activity</h2>
<table><tr><th>Action</th><th>User</th><th>Date</th></tr>
<tr><td>Published "<a href="/wp-admin/post.php?post=142&action=edit">Getting Started Guide</a>"</td><td>admin</td><td>${new Date().toLocaleDateString()}</td></tr>
<tr><td>Updated plugin <a href="/wp-admin/plugins.php">WooCommerce</a></td><td>admin</td><td>${new Date(Date.now() - 86400000).toLocaleDateString()}</td></tr>
<tr><td>Approved <a href="/wp-admin/edit-comments.php">comment</a> on "Contact Us"</td><td>editor</td><td>${new Date(Date.now() - 172800000).toLocaleDateString()}</td></tr>
</table></div>
<div class="card"><h2>Quick Draft</h2><p>Use the form below to quickly create a new draft post.</p>
<form action="/wp-admin/post-new.php" method="post" style="margin-top:10px" onsubmit="event.preventDefault(); alert('Draft saved successfully (locally)');">
<input type="text" placeholder="Title" style="width:100%;padding:6px;margin-bottom:8px;border:1px solid #8c8f94;border-radius:3px">
<textarea placeholder="What's on your mind?" style="width:100%;height:80px;padding:6px;border:1px solid #8c8f94;border-radius:3px;resize:vertical"></textarea>
<button type="submit" style="margin-top:8px;background:#2271b1;color:#fff;border:none;padding:6px 16px;border-radius:3px;cursor:pointer">Save Draft</button>
</form></div>
</div></div>
</body>
</html>`;
}

/**
 * Generates a realistic fake .env file content packed with fake keys and database secrets.
 */
export function fakeEnvContent(): string {
  const base64Key = btoa(Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => String.fromCharCode(b)).join("")).substring(0, 44);
  const dbUserNum = Math.floor(Math.random() * 9999);
  const dbPassword = Array.from(crypto.getRandomValues(new Uint8Array(20))).map((b) => String.fromCharCode(33 + (b % 94))).join("");
  const redisPassword = Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => String.fromCharCode(33 + (b % 94))).join("");
  const awsAccessKey = "AKIA" + Array.from(crypto.getRandomValues(new Uint8Array(8))).map((b) => "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"[b % 32]).join("");
  const awsSecretKey = Array.from(crypto.getRandomValues(new Uint8Array(30))).map((b) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[b % 64]).join("");
  const stripePk = "pk_live_" + Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[b % 62]).join("");
  const stripeSk = "sk_live_" + Array.from(crypto.getRandomValues(new Uint8Array(24))).map((b) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[b % 62]).join("");
  const jwtSecret = Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b) => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[b % 62]).join("");

  return `# Application Settings
APP_NAME=MyEnterpriseApp
APP_ENV=production
APP_KEY=base64:${base64Key}
APP_DEBUG=false
APP_URL=https://localhost

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=db-cluster-mysql-replica.internal.net
DB_PORT=3306
DB_DATABASE=db_production_master
DB_USERNAME=admin_master_${dbUserNum}
DB_PASSWORD=${dbPassword}

# Cache Redis Config
REDIS_HOST=redis-node-01.cache.internal
REDIS_PORT=6379
REDIS_PASSWORD=${redisPassword}

# Amazon Web Services (AWS)
AWS_ACCESS_KEY_ID=${awsAccessKey}
AWS_SECRET_ACCESS_KEY=${awsSecretKey}
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=production-data-s3-bucket

# Payment Processing (Stripe)
STRIPE_PUBLIC_KEY=${stripePk}
STRIPE_SECRET_KEY=${stripeSk}

# JSON Web Tokens
JWT_SECRET=${jwtSecret}
JWT_ALGORITHM=HS256
JWT_EXPIRATION_TIME=86400
`;
}
