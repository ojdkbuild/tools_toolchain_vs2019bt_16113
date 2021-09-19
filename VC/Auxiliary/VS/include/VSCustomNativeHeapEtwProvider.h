/***
* ==++==
*
* Copyright (c) Microsoft Corporation. All rights reserved.
*
* ==--==
* =+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+
*
* VSCustomNativeHeapEtwProvider.h
*
* VSCustomNativeHeapEtwProvider Library
*
* =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
****/
// Copyright (c) Microsoft Corporation. All rights reserved.

#pragma once

#pragma comment(lib,"VSCustomNativeHeapEtwProvider.lib")

#ifndef __VS_CUSTOM_ETW_HEAP_EVENT_H__
#define __VS_CUSTOM_ETW_HEAP_EVENT_H__

typedef void* VSHeapTrackerHandle;
#define INVALID_VSHEAPTRACK_HANDLE_VALUE ((VSHeapTrackerHandle)-1)

#ifdef __cplusplus
#define EXTERN_C    extern "C"
#else
#define EXTERN_C    extern
#endif

//
// C Interface.
// Return value of INVALID_VSHEAPTRACK_HANDLE_VALUE indicates failure
EXTERN_C VSHeapTrackerHandle __stdcall OpenHeapTracker(const char* pHeapName);

// Return value of 0 indicate success
EXTERN_C size_t __stdcall CloseHeapTracker(VSHeapTrackerHandle heapHandle);

// Return value of 0 indicate success
EXTERN_C size_t __stdcall VSHeapTrackerAllocateEvent(VSHeapTrackerHandle heapHandle, const void *pAddress, unsigned long size);

// Return value of 0 indicate success
EXTERN_C size_t __stdcall VSHeapTrackerDeallocateEvent(VSHeapTrackerHandle heapHandle, const void *pAddress);

// Return value of 0 indicate success
EXTERN_C size_t __stdcall VSHeapTrackerReallocateEvent(VSHeapTrackerHandle heapHandle, const void *pNewAddress, unsigned long size, const void *pOldAddress);

//
// C++ Interface
#ifdef  __cplusplus

namespace VSHeapTracker
{
    class CHeapTracker
    {
    public:
        CHeapTracker(const char* pHeapName) noexcept
        {
            m_hTrackerHandle = OpenHeapTracker(pHeapName);
        }
        ~CHeapTracker() noexcept
        {
            CloseHeapTracker(m_hTrackerHandle);
        }
        size_t AllocateEvent(const void *pAddress, unsigned long size) const noexcept
        {
            return VSHeapTrackerAllocateEvent(m_hTrackerHandle, pAddress, size);
        }
        size_t DeallocateEvent(const void *pAddress) const noexcept
        {
            return VSHeapTrackerDeallocateEvent(m_hTrackerHandle, pAddress);
        }
        size_t ReallocateEvent(const void *pNewAddress, unsigned long size, const void *pOldAddress) const noexcept
        {
            return VSHeapTrackerReallocateEvent(m_hTrackerHandle, pNewAddress, size, pOldAddress);
        }
        bool IsValidObject() noexcept
        {
            return m_hTrackerHandle == INVALID_VSHEAPTRACK_HANDLE_VALUE ? false : true;
        }
    private:
        VSHeapTrackerHandle m_hTrackerHandle;
    };
};
#endif

#endif // __VS_CUSTOM_ETW_HEAP_EVENT_H__
