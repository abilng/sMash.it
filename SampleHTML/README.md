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

* **_hresource-datatype_**
> Annotates the datatype  of the attribute.Permissible types are follows:

> * Integer or Int 
> * String
> * Float
> * Int64
>>> 64 bit integer. 
> * Range
>>> eg: ` Range(0.0,1.0) ` specifies floating point number between 0 and 1 and ` Range(0,1) ` specifies integer between 0 and 1.
> * Boolean or Bool
> * Date or Time
>>> should specify date formatting.
> * Timestamp

* **_hresource-error_**
> This is the root annotation that marks the error listing.It should contain two sub-annotation **_error-code_** and **_comment_** whic speicify error code and description of error respectively.
~~~~HTML
<li class="hresource-error">
      <code class="error-code">201</code> -<span class="comment">test failed</span>
~~~~ 


The following annotations for inter-links between services are defined to enable discovery: 

* **Link to Superclass**
> When a resource is a subclass of another resource, this link is indicated by the rel attribute `hresource-is-a`. This implies that wherever the superclass is accepted, the subclass is also accepted. 

>> `eg: <a rel="hresource-is-a" href="http://dublincore.org/book/"> Book </a>` 

* **Link to Consumers**
> When an attribute of a service is consumed by another known service, this is annotated using a rel attribute `hresource-consumed-by`. This enables a software agent to find out what all can be done with the resource that it has already retrieved.

>> `<a rel="hresource-consumed-by" href="documentaion_url#attribute">api_name</a>`

* **Link to Producers**
> Similar to the link to consumers, services can annotate a link to a producer of one of its attributes. This helps reverse traversal of resources and also  makes the system more peer-to-peer. This way, a link needs to be provided in either at one of the consumers or at the provider and an agent can identify this with link traversal. The annotation is made with the rel attribute `hresource-produced-by`.

