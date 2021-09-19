<?xml version="1.0" encoding="utf-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl='urn:schemas-microsoft-com:xslt'>
  <xsl:output omit-xml-declaration="yes" />

  <!-- Keys -->
  <xsl:key name="ProjectKey" match="Event" use="@Project" />

  <!-- String split template -->
  <xsl:template name="SplitString">
    <xsl:param name="source"      select="''" />
    <xsl:param name="separator" select="','" />
    <xsl:if test="not($source = '' or $separator = '')">
      <xsl:variable name="head" select="substring-before(concat($source, $separator), $separator)" />
      <xsl:variable name="tail" select="substring-after($source, $separator)" />
      <part>
        <xsl:value-of select="$head"/>
      </part>
      <xsl:call-template name="SplitString">
        <xsl:with-param name="source" select="$tail" />
        <xsl:with-param name="separator" select="$separator" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>

  <!-- Intermediate Templates -->
  <xsl:template match="UpgradeReport" mode="ProjectOverviewXML">
    <Projects>
      <xsl:for-each select="Event[generate-id(.) = generate-id(key('ProjectKey', @Project))]">
        <Project>
          <xsl:variable name="pNode" select="current()" />
          <xsl:variable name="errorCount" select="count(../Event[@Project = current()/@Project and @ErrorLevel=2])" />
          <xsl:variable name="warningCount" select="count(../Event[@Project = current()/@Project and @ErrorLevel=1])" />
          <xsl:variable name="messageCount" select="count(../Event[@Project = current()/@Project and @ErrorLevel=0])" />
          <xsl:variable name="pathSplitSeparator">
            <xsl:text>\</xsl:text>
          </xsl:variable>
          <xsl:variable name="projectName">
            <xsl:choose>
              <xsl:when test="@Project = ''">Solution</xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="@Project"/>
              </xsl:otherwise>
            </xsl:choose>
          </xsl:variable>
          <xsl:attribute name="IsSolution">
            <xsl:value-of select="@Project = ''"/>
          </xsl:attribute>
          <xsl:attribute name="Project">
            <xsl:value-of select="$projectName"/>
          </xsl:attribute>
          <xsl:attribute name="ProjectDisplayName">

            <xsl:variable name="localProjectName" select="@Project" />

            <!-- Sometimes it is possible to have project name set to a path over a real project name,
                 we split the string on '\' and if we end up with >1 part in the resulting tokens set
                 we format the ProjectDisplayName as ..\prior\last -->
            <xsl:variable name="pathTokens">
              <xsl:call-template name="SplitString">
                <xsl:with-param name="source" select="$localProjectName" />
                <xsl:with-param name="separator" select="$pathSplitSeparator" />
              </xsl:call-template>
            </xsl:variable>

            <xsl:choose>
              <xsl:when test="count(msxsl:node-set($pathTokens)/part) > 1">
                <xsl:value-of select="concat('..', $pathSplitSeparator, msxsl:node-set($pathTokens)/part[last() - 1], $pathSplitSeparator, msxsl:node-set($pathTokens)/part[last()])"/>
              </xsl:when>
              <xsl:otherwise>
                <xsl:value-of select="$localProjectName"/>
              </xsl:otherwise>
            </xsl:choose>

          </xsl:attribute>
          <xsl:attribute name="ProjectSafeName">
            <xsl:value-of select="translate($projectName, '\', '-')"/>
          </xsl:attribute>
          <xsl:attribute name="Solution">
            <xsl:value-of select="/UpgradeReport/Properties/Property[@Name='Solution']/@Value"/>
          </xsl:attribute>
          <xsl:attribute name="Source">
            <xsl:value-of select="@Source"/>
          </xsl:attribute>
          <xsl:attribute name="Status">
            <xsl:choose>
              <xsl:when test="$errorCount > 0">Error</xsl:when>
              <xsl:when test="$warningCount > 0">Warning</xsl:when>
              <xsl:otherwise>Success</xsl:otherwise>
            </xsl:choose>
          </xsl:attribute>
          <xsl:attribute name="ErrorCount">
            <xsl:value-of select="$errorCount" />
          </xsl:attribute>
          <xsl:attribute name="WarningCount">
            <xsl:value-of select="$warningCount" />
          </xsl:attribute>
          <xsl:attribute name="MessageCount">
            <xsl:value-of select="$messageCount" />
          </xsl:attribute>
          <xsl:attribute name="TotalCount">
            <xsl:value-of select="$errorCount + $warningCount + $messageCount"/>
          </xsl:attribute>
          <xsl:for-each select="../Event[@Project = $pNode/@Project and @ErrorLevel=3]">
            <ConversionStatus>
              <xsl:value-of select="@Description"/>
            </ConversionStatus>
          </xsl:for-each>
          <Messages>
            <xsl:for-each select="../Event[@Project = $pNode/@Project and @ErrorLevel&lt;3]">
              <Message>
                <xsl:attribute name="Level">
                  <xsl:value-of select="@ErrorLevel" />
                </xsl:attribute>
                <xsl:attribute name="Status">
                  <xsl:choose>
                    <xsl:when test="@ErrorLevel = 0">Message</xsl:when>
                    <xsl:when test="@ErrorLevel = 1">Warning</xsl:when>
                    <xsl:when test="@ErrorLevel = 2">Error</xsl:when>
                    <xsl:otherwise>Message</xsl:otherwise>
                  </xsl:choose>
                </xsl:attribute>
                <xsl:attribute name="Source">
                  <xsl:value-of select="@Source"/>
                </xsl:attribute>
                <xsl:attribute name="Message">
                  <xsl:value-of select="@Description"/>
                </xsl:attribute>
              </Message>
            </xsl:for-each>
          </Messages>
        </Project>
      </xsl:for-each>
    </Projects>
  </xsl:template>



  <!-- Project Overview template -->
  <xsl:template match="Projects" mode="ProjectOverview">

    <table>
      <tr>
        <th></th>
        <th _locID="ProjectTableHeader">Project</th>
        <th _locID="PathTableHeader">Path</th>
        <th _locID="ErrorsTableHeader">Errors</th>
        <th _locID="WarningsTableHeader">Warnings</th>
        <th _locID="MessagesTableHeader">Messages</th>
      </tr>

      <xsl:for-each select="Project">

        <xsl:sort select="@ErrorCount" order="descending" />
        <xsl:sort select="@WarningCount" order="descending" />
        <!-- Always make solution last within a group -->
        <xsl:sort select="@IsSolution" order="ascending" />
        <xsl:sort select="@ProjectSafeName" order="ascending" />

        <tr>
          <td>
              <xsl:attribute name ="class">
                <xsl:choose>
                  <xsl:when test="@Status = 'Error'">IconErrorEncoded</xsl:when>
                  <xsl:when test="@Status = 'Warning'">IconWarningEncoded</xsl:when>
                  <xsl:when test="@Status = 'Success'">IconSuccessEncoded</xsl:when>
                </xsl:choose>
              </xsl:attribute>
          </td>
          <td>
            <strong>
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="concat('#', @ProjectSafeName)"/>
                </xsl:attribute>
                <xsl:choose>
                  <xsl:when test="@ProjectDisplayName = ''">
                    <span _locID="OverviewSolutionSpan">Solution</span>
                  </xsl:when>
                  <xsl:otherwise>
                    <xsl:value-of select="@ProjectDisplayName" />
                  </xsl:otherwise>
                </xsl:choose>
              </a>
            </strong>
          </td>
          <td>
            <xsl:value-of select="@Source" />
          </td>
          <td class="textCentered">
            <a>
              <xsl:if test="@ErrorCount > 0">
                <xsl:attribute name="href">
                  <xsl:value-of select="concat('#', @ProjectSafeName, 'Error')"/>
                </xsl:attribute>
              </xsl:if>
              <xsl:value-of select="@ErrorCount" />
            </a>
          </td>
          <td class="textCentered">
            <a>
              <xsl:if test="@WarningCount > 0">
                <xsl:attribute name="href">
                  <xsl:value-of select="concat('#', @ProjectSafeName, 'Warning')"/>
                </xsl:attribute>
              </xsl:if>
              <xsl:value-of select="@WarningCount" />
            </a>
          </td>
          <td class="textCentered">
            <a href="#">
              <xsl:if test="@MessageCount > 0">
                <xsl:attribute name="onclick">
                  <xsl:variable name="apos">
                    <xsl:text>'</xsl:text>
                  </xsl:variable>
                  <xsl:variable name="JS" select="concat('ScrollToFirstVisibleMessage(', $apos, @ProjectSafeName, $apos, ')')" />
                  <xsl:value-of select="concat($JS, '; return false;')"/>
                </xsl:attribute>
              </xsl:if>
              <xsl:value-of select="@MessageCount" />
            </a>
          </td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:template>

  <!-- Show messages row -->
  <xsl:template match="Project" mode="ProjectShowMessages">
    <tr>
      <xsl:attribute name="name">
        <xsl:value-of select="concat('MessageRowHeaderShow', @ProjectSafeName)"/>
      </xsl:attribute>
      <td class="IconInfoEncoded"/>
      <td class="messageCell">
        <xsl:variable name="apos">
          <xsl:text>'</xsl:text>
        </xsl:variable>
        <xsl:variable name="toggleRowsJS" select="concat('ToggleMessageVisibility(', $apos, @ProjectSafeName, $apos, ')')" />

        <a _locID="ShowAdditionalMessages" href="#">
          <xsl:attribute name="name">
            <xsl:value-of select="concat(@ProjectSafeName, 'Message')"/>
          </xsl:attribute>
          <xsl:attribute name="onclick">
            <xsl:value-of select="concat($toggleRowsJS, '; return false;')"/>
          </xsl:attribute>
          Show <xsl:value-of select="@MessageCount" /> additional messages
        </a>
      </td>
    </tr>
  </xsl:template>

  <!-- Hide messages row -->
  <xsl:template match="Project" mode="ProjectHideMessages">
    <tr style="display: none">
      <xsl:attribute name="name">
        <xsl:value-of select="concat('MessageRowHeaderHide', @ProjectSafeName)"/>
      </xsl:attribute>
      <td class="IconInfoEncoded"/>
      <td class="messageCell">
        <xsl:variable name="apos">
          <xsl:text>'</xsl:text>
        </xsl:variable>
        <xsl:variable name="toggleRowsJS" select="concat('ToggleMessageVisibility(', $apos, @ProjectSafeName, $apos, ')')" />

        <a _locID="HideAdditionalMessages" href="#">
          <xsl:attribute name="name">
            <xsl:value-of select="concat(@ProjectSafeName, 'Message')"/>
          </xsl:attribute>
          <xsl:attribute name="onclick">
            <xsl:value-of select="concat($toggleRowsJS, '; return false;')"/>
          </xsl:attribute>
          Hide <xsl:value-of select="@MessageCount" /> additional messages
        </a>
      </td>
    </tr>
  </xsl:template>

  <!-- Message row templates -->
  <xsl:template match="Message">
    <tr>
      <xsl:attribute name="name">
        <xsl:value-of select="concat(@Status, 'RowClass', ../../@ProjectSafeName)"/>
      </xsl:attribute>

      <xsl:if test="@Level = 0">
        <xsl:attribute name="style">display: none</xsl:attribute>
      </xsl:if>
      <td>
        <xsl:attribute name ="class">
        <xsl:choose>
            <xsl:when test="@Status = 'Error'">IconErrorEncoded</xsl:when>
            <xsl:when test="@Status = 'Warning'">IconWarningEncoded</xsl:when>
            <xsl:when test="@Status = 'Message'">IconInfoEncoded</xsl:when>
        </xsl:choose>
        </xsl:attribute>
        <a>
          <xsl:attribute name="name">
            <xsl:value-of select="concat(../../@ProjectSafeName, @Status)"/>
          </xsl:attribute>
        </a>
      </td>
      <td class="messageCell">
        <strong>
          <xsl:value-of select="@Source"/>:
        </strong>
        <span>
          <xsl:value-of select="@Message"/>
        </span>
      </td>
    </tr>
  </xsl:template>

  <!-- Project Details Template -->
  <xsl:template match="Projects" mode="ProjectDetails">

    <xsl:for-each select="Project">
      <xsl:sort select="@ErrorCount" order="descending" />
      <xsl:sort select="@WarningCount" order="descending" />
      <!-- Always make solution last within a group -->
      <xsl:sort select="@IsSolution" order="ascending" />
      <xsl:sort select="@ProjectSafeName" order="ascending" />

      <a>
        <xsl:attribute name="name">
          <xsl:value-of select="@ProjectSafeName"/>
        </xsl:attribute>
      </a>
      <xsl:choose>
        <xsl:when test="@ProjectDisplayName = ''">
          <h3 _locID="ProjectDisplayNameHeader">Solution</h3>
        </xsl:when>
        <xsl:otherwise>
          <h3>
            <xsl:value-of select="@ProjectDisplayName"/>
          </h3>
        </xsl:otherwise>
      </xsl:choose>

      <table>
        <tr>
          <xsl:attribute name="id">
            <xsl:value-of select="concat(@ProjectSafeName, 'HeaderRow')"/>
          </xsl:attribute>
          <th></th>
          <th class="messageCell" _locID="MessageTableHeader">Message</th>
        </tr>

        <!-- Errors and warnings -->
        <xsl:for-each select="Messages/Message[@Level &gt; 0]">
          <xsl:sort select="@Level" order="descending" />
          <xsl:apply-templates select="." />
        </xsl:for-each>

        <xsl:if test="@MessageCount > 0">
          <xsl:apply-templates select="." mode="ProjectShowMessages" />
        </xsl:if>

        <!-- Messages -->
        <xsl:for-each select="Messages/Message[@Level = 0]">
          <xsl:apply-templates select="." />
        </xsl:for-each>

        <xsl:choose>
          <!-- Additional row as a 'place holder' for 'Show/Hide' additional messages -->
          <xsl:when test="@MessageCount > 0">
            <xsl:apply-templates select="." mode="ProjectHideMessages" />
          </xsl:when>
          <!-- No messages at all, show blank row -->
          <xsl:when test="@TotalCount = 0">
            <tr>
              <td class="IconInfoEncoded"/>
              <xsl:choose>
                <xsl:when test="@ProjectDisplayName = ''">
                  <td class="messageCell" _locID="NoMessagesRow2">
                    Solution logged no messages.
                  </td>
                </xsl:when>
                <xsl:otherwise>
                  <td class="messageCell" _locID="NoMessagesRow">
                    <xsl:value-of select="@ProjectDisplayName" /> logged no messages.
                  </td>
                </xsl:otherwise>
              </xsl:choose>
            </tr>
          </xsl:when>
        </xsl:choose>
      </table>
    </xsl:for-each>
  </xsl:template>

  <!-- Document, matches "UpgradeReport" -->
  <xsl:template match="UpgradeReport">
    <!-- Output doc type the 'Mark of the web' which disabled prompting to run JavaScript from local HTML Files in IE -->
    <!-- NOTE: The whitespace around the 'Mark of the web' is important it must be exact -->
    <xsl:text disable-output-escaping="yes"><![CDATA[<!DOCTYPE html>
<!-- saved from url=(0014)about:internet -->
]]>
    </xsl:text>
    <html>
      <head>
        <meta content="en-us" http-equiv="Content-Language" />
        <meta content="text/html; charset=utf-16" http-equiv="Content-Type" />
        <title _locID="ConversionReport0">
          Migration Report
        </title>
        <style>
            <xsl:text disable-output-escaping="yes">
                <![CDATA[
                    /* Body style, for the entire document */
                    body
                    {
                        background: #F3F3F4;
                        color: #1E1E1F;
                        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                        padding: 0;
                        margin: 0;
                    }

                    /* Header1 style, used for the main title */
                    h1
                    {
                        padding: 10px 0px 10px 10px;
                        font-size: 21pt;
                        background-color: #E2E2E2;
                        border-bottom: 1px #C1C1C2 solid; 
                        color: #201F20;
                        margin: 0;
                        font-weight: normal;
                    }

                    /* Header2 style, used for "Overview" and other sections */
                    h2
                    {
                        font-size: 18pt;
                        font-weight: normal;
                        padding: 15px 0 5px 0;
                        margin: 0;
                    }

                    /* Header3 style, used for sub-sections, such as project name */
                    h3
                    {
                        font-weight: normal;
                        font-size: 15pt;
                        margin: 0;
                        padding: 15px 0 5px 0;
                        background-color: transparent;
                    }

                    /* Color all hyperlinks one color */
                    a
                    {
                        color: #1382CE;
                    }

                    /* Table styles */ 
                    table
                    {
                        border-spacing: 0 0;
                        border-collapse: collapse;
                        font-size: 10pt;
                    }

                    table th
                    {
                        background: #E7E7E8;
                        text-align: left;
                        text-decoration: none;
                        font-weight: normal;
                        padding: 3px 6px 3px 6px;
                    }

                    table td
                    {
                        vertical-align: top;
                        padding: 3px 6px 5px 5px;
                        margin: 0px;
                        border: 1px solid #E7E7E8;
                        background: #F7F7F8;
                    }

                    /* Local link is a style for hyperlinks that link to file:/// content, there are lots so color them as 'normal' text until the user mouse overs */
                    .localLink
                    {
                        color: #1E1E1F;
                        background: #EEEEED;
                        text-decoration: none;
                    }

                    .localLink:hover
                    {
                        color: #1382CE;
                        background: #FFFF99;
                        text-decoration: none;
                    }

                    /* Center text, used in the over views cells that contain message level counts */ 
                    .textCentered
                    {
                        text-align: center;
                    }

                    /* The message cells in message tables should take up all avaliable space */
                    .messageCell
                    {
                        width: 100%;
                    }

                    /* Padding around the content after the h1 */ 
                    #content 
                    {
	                    padding: 0px 12px 12px 12px; 
                    }

                    /* The overview table expands to width, with a max width of 97% */ 
                    #overview table
                    {
                        width: auto;
                        max-width: 75%; 
                    }

                    /* The messages tables are always 97% width */
                    #messages table
                    {
                        width: 97%;
                    }

                    /* All Icons */
                    .IconSuccessEncoded, .IconInfoEncoded, .IconWarningEncoded, .IconErrorEncoded
                    {
                        min-width:18px;
                        min-height:18px; 
                        background-repeat:no-repeat;
                        background-position:center;
                    }

                    /* Success icon encoded */
                    .IconSuccessEncoded
                    {
                        /* Note: Do not delete the comment below. It is used to verify the correctness of the encoded image resource below before the product is released */
                        /* [---XsltValidateInternal-Base64EncodedImage:IconSuccess#Begin#background-image: url(data:image/png;base64,#Separator#);#End#] */
                        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAABcElEQVR4Xq2TsUsCURzHv15g8ZJcBWlyiYYgCIWcb9DFRRwMW5TA2c0/QEFwFkxxUQdxVlBwCYWOi6IhWgQhBLHJUCkhLr/BW8S7gvrAg+N+v8/v+x68Z8MGy+XSCyABQAXgBgHGALoASkIIDWSLeLBetdHryMjd5IxQPWT4rn1c/P7+xxp72Cs9m5SZ0Bq2vPnbPFafK2zDvmNHypdC0BPkLlQhxJsCAhQoZwdZU5mwxh720qGo8MzTxTTKZDPCx2HoVzp6lz0Q9tKhyx0kGs8Ny+TkWRKk8lCROwEduhyg9l/6lunOPSfmH3NUH6uQ0KHLAe7JYvJjevm+DAMGJHToKtigE+vwvIidxLamb8IBY9e+C5LiXREkfho3TSd06HJA13/oh6T51MTsfQbHrsMynQ5dDihFjiK8JJAU9AKIWTp76dCVN7HWHrajmUEGvyF9nkbAE6gLIS7kTUyuf2gscLoJrElZo/Mvj+nPz/kLTmfnEwP3tB0AAAAASUVORK5CYII=);
                    }

                    /* Information icon encoded */
                    .IconInfoEncoded
                    {
                        /* Note: Do not delete the comment below. It is used to verify the correctness of the encoded image resource below before the product is released */
                        /* [---XsltValidateInternal-Base64EncodedImage:IconInformation#Begin#background-image: url(data:image/png;base64,#Separator#);#End#] */
                        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABHElEQVR4Xs2TsUoDQRRF7wwoziokjZUKadInhdhukR9YP8DMX1hYW+QvdsXa/QHBbcXC7W0CamWTQnclFutceIQJwwaWNLlwm5k5d94M76mmaeCrrmsLYOocY12FcxZFUeozCqKqqgYA8uevv1H6VuPxcwlfk5N92KHBxfFeCSAxxswlYAW/Xr989x/mv9gkhtyMDhcAxgzRsp7flj8B/HF1RsMXq+NZMkopaHe7lbKxQUEIGbKsYNoGn969060hZBkQex/W8oRQwsQaW2o3Ago2SVcJUzAgY3N0lTCZZm+zPS8HB51gMmS1DEYyOz9acKO1D8JWTlafKIMxdhvlfdyT94Vv5h7P8Ky7nQzACmhvKq3zk3PjW9asz9D/1oigecsioooAAAAASUVORK5CYII=);
                    }

                    /* Warning icon encoded */
                    .IconWarningEncoded
                    {
                        /* Note: Do not delete the comment below. It is used to verify the correctness of the encoded image resource below before the product is released */
                        /* [---XsltValidateInternal-Base64EncodedImage:IconWarning#Begin#background-image: url(data:image/png;base64,#Separator#);#End#] */
                        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAx0lEQVR4XpWSMQ7CMAxFf4xAyBMLCxMrO8dhaBcuwdCJS3RJBw7SA/QGTCxdWJgiQYWKXJWKIXHIlyw5lqr34tQgEOdcBsCOx5yZK3hCCKdYXneQkh4pEfqzLfu+wVDSyyzFoJjfz9NB+pAF+eizx2Vruts0k15mPgvS6GYvpVtQhB61IB/dk6AF6fS4Ben0uIX5odtFe8Q/eW1KvFeH4e8khT6+gm5B+t3juyDt7n0jpe+CANTd+oTUjN/U3yVaABnSUjFz/gFq44JaVSCXeQAAAABJRU5ErkJggg==);
                    }

                    /* Error icon encoded */
                    .IconErrorEncoded
                    {
                        /* Note: Do not delete the comment below. It is used to verify the correctness of the encoded image resource below before the product is released */
                        /* [---XsltValidateInternal-Base64EncodedImage:IconError#Begin#background-image: url(data:image/png;base64,#Separator#);#End#] */
                        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABQElEQVR4XqWTvUoEQRCE6wYPZUA80AfwAQz23uCMjA7MDRQEIzPBVEyNTQUFIw00vcQTTMzuAh/AxEQQT8HF/3G/oGGnEUGuoNnd6qoZuqltyKEsyzVJq5I6rnUp6SjGeGhESikzzlc1eL7opfuVbrqbU1Zw9NCgtQMaZpY0eNnaaL2fHusvTK5vKu7sjSS1Y4y3QUA6K3e3Mau5UFDyMP7tYF9o8cAHZv68vipoIJg971PZIZ5HiwdvYGGvFVFHmGmZ2MxwmQYPXubPl9Up0tfoMQGetXd6mRbvhBw+boZ6WF7Mbv1+GsHRk0fQmPAH1GfmZirbCfDJ61tw3Px8/8pZsPAG4jlVhcPgZ7adwNWBB68lkRQWFiTgFlbnLY3DGGM7izIJIyT/jjIvEJw6fdJTc6krDzh6aMwMP9bvDH4ADSsa9uSWVJkAAAAASUVORK5CYII=);
                    }
                ]]>
            </xsl:text>
        </style>
        <script type="text/javascript" language="javascript">
          <xsl:text disable-output-escaping="yes">
          <![CDATA[
          
            // Startup 
            // Hook up the the loaded event for the document/window, to linkify the document content
            var startupFunction = function() { linkifyElement("messages"); };
            
            if(window.attachEvent)
            {
              window.attachEvent('onload', startupFunction);
            }
            else if (window.addEventListener) 
            {
              window.addEventListener('load', startupFunction, false);
            }
            else 
            {
              document.addEventListener('load', startupFunction, false);
            } 
            
            // Toggles the visibility of table rows with the specified name 
            function toggleTableRowsByName(name)
            {
               var allRows = document.getElementsByTagName('tr');
               for (i=0; i < allRows.length; i++)
               {
                  var currentName = allRows[i].getAttribute('name');
                  if(!!currentName && currentName.indexOf(name) == 0)
                  {
                      var isVisible = allRows[i].style.display == ''; 
                      isVisible ? allRows[i].style.display = 'none' : allRows[i].style.display = '';
                  }
               }
            }
            
            function scrollToFirstVisibleRow(name) 
            {
               var allRows = document.getElementsByTagName('tr');
               for (i=0; i < allRows.length; i++)
               {
                  var currentName = allRows[i].getAttribute('name');
                  var isVisible = allRows[i].style.display == ''; 
                  if(!!currentName && currentName.indexOf(name) == 0 && isVisible)
                  {
                     allRows[i].scrollIntoView(true); 
                     return true; 
                  }
               }
               
               return false;
            }
            
            // Linkifies the specified text content, replaces candidate links with html links 
            function linkify(text)
            {
                 if(!text || 0 === text.length)
                 {
                     return text; 
                 }

                 // Find http, https and ftp links and replace them with hyper links 
                 var urlLink = /(http|https|ftp)\:\/\/[a-zA-Z0-9\-\.]+(:[a-zA-Z0-9]*)?\/?([a-zA-Z0-9\-\._\?\,\/\\\+&%\$#\=~;\{\}])*/gi;
                 
                 return text.replace(urlLink, '<a href="$&">$&</a>') ;
            }
            
            // Linkifies the specified element by ID
            function linkifyElement(id)
            {
                var element = document.getElementById(id);
                if(!!element)
                {
                  element.innerHTML = linkify(element.innerHTML); 
                }
            }
            
            function ToggleMessageVisibility(projectName)
            {
              if(!projectName || 0 === projectName.length)
              {
                return; 
              }
              
              toggleTableRowsByName("MessageRowClass" + projectName);
              toggleTableRowsByName('MessageRowHeaderShow' + projectName);
              toggleTableRowsByName('MessageRowHeaderHide' + projectName); 
            }
            
            function ScrollToFirstVisibleMessage(projectName)
            {
              if(!projectName || 0 === projectName.length)
              {
                return; 
              }
              
              // First try the 'Show messages' row
              if(!scrollToFirstVisibleRow('MessageRowHeaderShow' + projectName))
              {
                // Failed to find a visible row for 'Show messages', try an actual message row 
                scrollToFirstVisibleRow('MessageRowClass' + projectName); 
              }
            }
          ]]>
        </xsl:text>
        </script>
      </head>
      <body>
        <h1 _locID="ConversionReport">
          Migration Report - <xsl:value-of select="Properties/Property[@Name='Solution']/@Value"/>
        </h1>

        <div id="content">
          <h2 _locID="OverviewTitle">Overview</h2>
          <xsl:variable name="projectOverview">
            <xsl:apply-templates select="self::node()" mode="ProjectOverviewXML" />
          </xsl:variable>

          <div id="overview">
            <xsl:apply-templates select="msxsl:node-set($projectOverview)/*" mode="ProjectOverview" />
          </div>

          <h2 _locID="SolutionAndProjectsTitle">Solution and projects</h2>

          <div id="messages">
            <xsl:apply-templates select="msxsl:node-set($projectOverview)/*" mode="ProjectDetails" />
          </div>
        </div>
      </body>
    </html>
  </xsl:template>

</xsl:stylesheet>