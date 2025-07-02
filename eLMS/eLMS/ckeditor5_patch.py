import django.utils.encoding
from django.utils.encoding import force_str

# Patch để thay thế force_text = force_str
django.utils.encoding.force_text = force_str
