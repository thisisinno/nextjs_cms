const API_BASE = (process.env.CMS_API_BASE || 'https://demo.schoolsoft.online/api').replace(/\/+$/, '');
const username = process.env.CMS_USERNAME;
const password = process.env.CMS_PASSWORD;

const FALLBACKS = {
  site: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=1400',
  architecture: 'https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=1400',
  villa: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1400',
  interior: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1400',
  renovation: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=1400',
  pool: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1400',
  commercial: 'https://images.pexels.com/photos/236698/pexels-photo-236698.jpeg?auto=compress&cs=tinysrgb&w=1400',
  workers: 'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1400',
};

function endpoint(path) {
  return `${API_BASE}/${path.replace(/^\//, '')}`;
}

function hasImage(project) {
  return Boolean(project.image || project.image_url || project.image_external_url);
}

function pickImage(project) {
  const text = `${project.title || ''} ${project.category || ''} ${project.status || ''} ${project.slug || ''}`.toLowerCase();
  if (/(villa|luxury|home|house|residential)/.test(text)) return FALLBACKS.villa;
  if (/(pool|swimming)/.test(text)) return FALLBACKS.pool;
  if (/(renovation|renovate|renew|re-new|repair|upgrade)/.test(text)) return FALLBACKS.renovation;
  if (/(interior|exterior|decor|finish|finishing)/.test(text)) return FALLBACKS.interior;
  if (/(site|daily|management|team|supervision)/.test(text)) return FALLBACKS.site;
  if (/(architect|architecture|blueprint|design)/.test(text)) return FALLBACKS.architecture;
  if (/(commercial|office|shop|hotel|business)/.test(text)) return FALLBACKS.commercial;
  return FALLBACKS.workers;
}

async function request(path, options = {}) {
  const response = await fetch(endpoint(path), {
    ...options,
    headers: {
      ...(options.body && !options.headers?.['Content-Type'] ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${path} failed with ${response.status}: ${text}`);
  }
  return body;
}

async function main() {
  if (!username || !password) {
    throw new Error('Set CMS_USERNAME and CMS_PASSWORD before running this script.');
  }

  const token = await request('/auth/token/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  const auth = { Authorization: `Bearer ${token.access}` };
  const result = await request('/admin/projects/', { headers: auth });
  const projects = Array.isArray(result) ? result : result.results || [];
  let updated = 0;

  for (const project of projects) {
    if (hasImage(project)) {
      console.log(`skip: ${project.title || project.id} already has an image`);
      continue;
    }

    const image_external_url = pickImage(project);
    await request(`/admin/projects/${project.id}/`, {
      method: 'PATCH',
      headers: auth,
      body: JSON.stringify({ image_external_url }),
    });
    updated += 1;
    console.log(`updated: ${project.title || project.id} -> ${image_external_url}`);
  }

  console.log(`done: ${updated} project${updated === 1 ? '' : 's'} updated`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
