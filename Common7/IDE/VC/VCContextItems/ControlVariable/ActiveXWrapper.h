#pragma once

$loctext_comment_header1$

$loctext_comment_header2$

/////////////////////////////////////////////////////////////////////////////

#include "afxwin.h"

class $classname$ : public CWnd
{
protected:
	DECLARE_DYNCREATE($classname$)
public:
	CLSID const& GetClsid()
	{
		static CLSID const clsid
			= $clsidguid$;
		return clsid;
	}
	virtual BOOL Create(LPCTSTR lpszClassName, LPCTSTR lpszWindowName, DWORD dwStyle,
						const RECT& rect, CWnd* pParentWnd, UINT nID, 
						CCreateContext* pContext = nullptr)
	{ 
		return CreateControl(GetClsid(), lpszWindowName, dwStyle, rect, pParentWnd, nID);
	}

	BOOL Create(LPCTSTR lpszWindowName, DWORD dwStyle, const RECT& rect, CWnd* pParentWnd,
				UINT nID, CFile* pPersist = nullptr, BOOL bStorage = FALSE,
				BSTR bstrLicKey = nullptr)
	{ 
		return CreateControl(GetClsid(), lpszWindowName, dwStyle, rect, pParentWnd, nID,
		pPersist, bStorage, bstrLicKey); 
	}

$loctext_comment_attributes$
public:
$classenums$

$loctext_comment_operations$
public:
$classtext$

};
