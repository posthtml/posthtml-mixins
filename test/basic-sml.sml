mixin(name="say", from)
	p Hello from {{ from }}!

div
	mixin(name="say", from="me")
