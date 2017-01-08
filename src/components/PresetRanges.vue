<template>
  <div class="presets">
    <ul class="ui-menu" role="menu" tabindex="0" :aria-activedescendant="preset_focus">
      <li class="ui-menu-item" role="presentation" v-for="(preset, idx) in preset_ranges" :id="preset_ui(idx)" @mouseover="preset_aria(idx)" @mouseout="preset_focus = ''" @click="doSelect(preset)">
        <span class="menu-item-text" tabindex="-1" role="menuitem">{{ preset.text }}</span>
      </li>
    </ul>
  </div> 
</template>

<script>
import moment from 'moment'

export default 
{
  name: 'preset-ranges',
  props:
  {
    presets:
    {
      type: Array,
      default: null
    }
  },
  data: function() 
  {
    var tmp =
    {
      preset_ranges: [],
			preset_prefix: 'preset-ui-',
      preset_focus: '', // which of the presets on the left panel is currently under mouse 
    };
    return tmp; // without Var there are strange unlogical syntax errors
  },
  created: function()
  {
    if(this.presets != null) this.preset_ranges = this.presets;
    else this.preset_ranges = 
		[
			{
			  text: 'Today', 
			  dateStart: function() 
			  { 
			    return moment().toDate();
			  }, 
			  dateEnd: function() 
			  { 
			    return moment().toDate();
			  } 
			},
			{
			  text: 'Yesterday', 
			  dateStart: function() 
			  { 
			    return moment().subtract('days', 1).toDate();
			  }, 
			  dateEnd: function() 
			  { 
			    return moment().subtract('days', 1).toDate();
			  } 
			},
			{
			  text: 'Last 7 Days', 
			  dateStart: function() 
			  { 
			    return moment().subtract('days', 6).toDate();
			  }, 
			  dateEnd: function() 
			  { 
			    return moment().toDate();
			  } 
			},
			{
			  text: 'Last Week (Mo-Su)', 
			  dateStart: function() 
			  { 
			    return moment().subtract('days', 7).isoWeekday(1).toDate();
			  }, 
			  dateEnd: function() 
			  { 
			    return moment().subtract('days', 7).isoWeekday(7).toDate();
			  } 
			},
			{
			  text: 'Month to Date', 
			  dateStart: function() 
			  { 
			    return moment().startOf('month').toDate();
			  }, 
			  dateEnd: function() 
			  { 
			    return moment().toDate();
			  } 
			},
			{
			  text: 'Previous Month', 
			  dateStart: function() 
			  { 
			    return moment().subtract('month', 1).startOf('month').toDate();
			  }, 
			  dateEnd: function() 
			  { 
			    return moment().subtract('month', 1).endOf('month').toDate();
			  } 
			},
			{
			  text: 'Year to Date', 
			  dateStart: function() 
			  { 
			    return moment().startOf('year').toDate();
			  }, 
			  dateEnd: function() 
			  { 
			    return moment().toDate();
			  } 
			}
		];
  },
  methods:
  {
    // inject the Moment.JS
    moment: function()
    {
      return moment();
    },
    preset_ui: function(id)
    {
      return this.preset_prefix + id;
    },
    preset_aria: function(id)
    {
      this.preset_focus = this.preset_ui(id);
    },
    doSelect: function(range)
    {
      this.$emit('onPreset',range.dateStart(),range.dateEnd());
    }
  }
}
</script>

<style lang="scss" scoped>
$bord_radius: 4px;

@mixin border-radius($radius)
{
  -webkit-border-radius: $radius;
     -moz-border-radius: $radius;
      -ms-border-radius: $radius;
          border-radius: $radius;  
}

.presets
{
  border-right: 1px solid #aaa;
  display: table-cell;
  vertical-align: top;
  padding: 2px 7px 7px 2px;  
}

.ui-menu
{
  white-space: nowrap;
  list-style: none;
  padding: 2px;
  margin: 0;
  display: block;
  outline: 0;  
}

.ui-menu-item
{
  cursor: pointer;
  margin: 0;
  padding: 0;
  width: 100%;
  list-style-image: url(data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7);
}

.ui-menu-item:hover
{
  @include border-radius($bord_radius);
  background: #DADADA;
  border: 1px solid #999;
  margin: -1px;
  color: #212121;
}

.menu-item-text
{
  display: block;
  padding: 2px .4em;
  line-height: 1.5;
  min-height: 0;
  font-weight: 400;
}
</style>
