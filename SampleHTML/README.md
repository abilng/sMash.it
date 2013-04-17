SampleHTML
==========

Services are described using special purpose annotations in the HTML code. These annotations are specified in the
class attribute of the associated tags. 

Following annotations are used for describing resources in a RESTful API.


* **_hresource_**
> This is the root annotation that marks the resource description. All other annotations are contained within an element marked with _class="hresource"_. A client parsing a page could treat the presence of this annotation as an indication of the existence of a resource description on the page. Unless all other annotations are encapsulated in an hresource, they will not be parsed.

* **_name_**
> Annotates the name of the resource. This can be any human readable name and need not have any programming significance.

* **_url/uri_**
> Annotates the URL at which the resource is accessible.

* **_attribute_**
> Annotates an attribute/property of the resource. All attributes of a resource should be annotated with this annotation. Specific characteristics of the attribute could be further specified by more annotations that are used together with the attribute annotation. 

* **_comment_**
> Provides a human-readable description of the attribute.

* **_required_**
> Indicates a required attribute. This annotation is always used along with the attribute annotation. 

* **_queryable_**
> Indicates an attribute that may be provided in the `HTTP` querystring during a  `GET` operation to filter the results. This annotation is always used along with the attribute annotation. 

* **_read-only_**
> Indicates a read-only attribute. A read-only attribute may be retrieved during a  `GET`  operation but may not be included in a `POST` or a `PUT`. This annotation is always used along with the attribute annotation. 

* **_write-once_**
> Indicates a write-once attribute that can be specified only during the create operation (`POST`) but not during update (`PUT`). This annotation is always used along with the attribute annotation. 

* **_guid_**
> Indicates if an attribute is a globally unique identifier for the resource that could be used across multiple services.