(function($) {

	"use strict";

	 $(document).ready(function() {
        $('#multiple-checkboxes').multiselect({
          includeSelectAllOption: false,
          enableFiltering : true,
          enableCaseInsensitiveFiltering: true,
          disableIfEmpty: true,
          disabledText: "No Tags",
        });
    });
	 
})(jQuery);
