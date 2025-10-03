---
layout: default
title: Home
---

<div class="wrapper">
  <section>
    <h1>Xi Li</h1>
    <p>Associate Professor of Logic<br>Central South University</p>
    <h3><a href="/">Home</a></h3>
    <h3><a href="/research.html">Research</a></h3>
    <h3><a href="/teaching.html">Teaching</a></h3>
    <h3><a href="/personal.html">Personal</a></h3>
    <h3><a href="/blog.html">Blog</a></h3>

    <p>At CSU, I teach courses in Mathematical Logic, and Philosophy of Artificial Intelligence.</p>
  </section>
</div>
# Welcome to My Jekyll Site

This is the homepage of my Jekyll site. Here you can find links to my latest blog posts and learn more about my research interests.

## Latest Posts

{% for post in site.posts %}
  * [{{ post.title }}]({{ post.url }}) - {{ post.date | date: "%B %d, %Y" }}
{% endfor %}

## About Me

I am an Associate Professor of Logic at Central South University. Feel free to explore my blog and research pages to learn more about my work.

## Navigation

- [About]({{ site.baseurl }}/pages/about.html)
- [Research]({{ site.baseurl }}/pages/research.html)
- [Blog]({{ site.baseurl }}/index.html)