This is the 0.6 version of the load script that is used to include interactive Flattr buttons in a web page.

We provide this script for the sake of transparency as the one we host is minified and thus hard to follow the flow of. We want to enable others to learn from our implementation and we want others to be able to know what is happening in their sites and suggest improvements on how it can do what it does in a better way.

# Minified hosted version

    https://api.flattr.com/js/0.6/load.js

# Documentation

[Embed buttons](http://developers.flattr.net/button/) in the Flattr Developer Platform

# Include in your site

```html
<script type="text/javascript">
/* <![CDATA[ */
(function() {
    var s = document.createElement('script');
    var t = document.getElementsByTagName('script')[0];

    s.type = 'text/javascript';
    s.async = true;
    s.src = '//api.flattr.com/js/0.6/load.js?mode=auto';

    t.parentNode.insertBefore(s, t);
 })();
/* ]]> */
</script>
```

# License

MIT [http://flattr.mit-license.org](http://flattr.mit-license.org)