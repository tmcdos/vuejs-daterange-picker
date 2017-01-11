<template>
  <section>
		<h2 class="page-header">
			<a id="examples" class="tgt">Examples</a>
		</h2>

		<article class="row">
			<div class="col-md-4">
				<h3>
					<a id="basics" class="tgt">The Basics</a>
				</h3>
				<p>DateRangePicker can take a regular input element like this:</p>
				<p>
					<input class="raw">
				</p>
				<p>and turn it into:</p>
				<p>
					<date-picker :options="{inline_picker:true, start_date: start, final_date: final}"></date-picker>
				</p>
			</div>
			<div class="col-md-8">
				<h3>Example Code</h3>
        <pre>
					<code class="html">
&lt;date-picker v-bind:options="{inline_picker:true, start_date: start, final_date: final}"&gt;&lt;/date-picker&gt;

&lt;script&gt;
export default 
{
  name: 'app',
  data () 
  {
    return {start:null,final:null};
  },
  created ()
  {
    var ds = new Date(), df = new Date();
    ds.setFullYear(2016,10,5);
    df.setFullYear(2016,11,20);
    this.start = ds;
    this.final = df;
  },
  methods:
  {
    
  }
}
&lt;/script&gt;
					</code>
        </pre>
		</article>

  </section>

</template>

<script>
export default 
{
  name: 'app',
  data () 
  {
    return {start:null,final:null};
  },
  created ()
  {
		var ds = new Date(), df = new Date();
		ds.setFullYear(2016,10,5);
		df.setFullYear(2016,11,20);
    this.start = ds;
		this.final = df;
  },
  methods:
  {
    
  }
}
</script>

<style>
section
{
	padding-top: 30px;
	padding-bottom: 30px;
	margin-left: 30px;
	margin-right: 30px;
}

.tgt 
{
	padding-top: 70px;
	color: inherit;
}

.tgt:hover 
{
	color: inherit;
	text-decoration: none;
}

a:focus 
{
	outline: 0;
}

.btn 
{
	padding: 4px 12px;
}

article + article 
{
	border-top: 1px solid #eee;
}

article 
{
	margin-bottom: 10px;
}

input.raw 
{
	width: 255px;
	padding: 4px 6px;
}

</style>