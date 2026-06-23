// assets/js/customComponents.js
window.initCustomSelects = function() {
    document.querySelectorAll('select:not([data-customized])').forEach(select => {
        select.setAttribute('data-customized', 'true');
        select.classList.add('sr-only'); // visually hide native
        
        const wrapper = document.createElement('div');
        wrapper.className = 'relative w-full custom-select-wrapper';
        
        const btn = document.createElement('button');
        btn.type = 'button';
        let btnClasses = select.className
            .replace(/sr-only/g, '')
            .replace(/appearance-none/g, '')
            .replace(/cursor-pointer/g, '')
            .trim();
        
        btn.className = `${btnClasses} flex justify-between items-center w-full focus:outline-none transition-colors`;
        btn.setAttribute('data-sys-audio', 'click');
        
        const label = document.createElement('span');
        label.className = 'truncate pr-2';
        label.textContent = select.options[select.selectedIndex]?.text || 'SELECCIONAR';
        
        const icon = document.createElement('i');
        icon.className = 'ph-bold ph-caret-down flex-shrink-0 transition-transform duration-200';
        
        btn.appendChild(label);
        btn.appendChild(icon);
        
        const listWrapper = document.createElement('div');
        if (!btnClasses.includes('border-4')) {
            listWrapper.className = `absolute top-full mt-2 left-0 w-full bg-brand-white border-4 border-brand-black z-[9999] hidden flex-col max-h-[40svh] overflow-y-auto overscroll-contain`;
        } else {
             listWrapper.className = `absolute top-full mt-[-4px] left-[-4px] w-[calc(100%+8px)] bg-brand-white border-4 border-brand-black border-t-0 z-[9999] hidden flex-col max-h-[40svh] overflow-y-auto overscroll-contain`;
        }

        const list = document.createElement('ul');
        list.className = 'flex flex-col w-full m-0 p-0 list-none';
        
        const renderOptions = () => {
            list.innerHTML = '';
            Array.from(select.options).forEach(opt => {
                const li = document.createElement('li');
                const isSelected = select.value === opt.value;
                const activeCls = isSelected ? 'bg-brand-black text-brand-white' : 'bg-brand-white text-brand-black hover:bg-brand-green';
                
                li.className = `px-6 py-4 border-b-4 border-brand-black last:border-b-0 cursor-pointer font-display font-bold uppercase tracking-widest text-sm transition-colors ${activeCls}`;
                li.textContent = opt.text;
                li.onclick = (e) => {
                    e.stopPropagation();
                    select.value = opt.value;
                    label.textContent = opt.text;
                    listWrapper.classList.add('hidden');
                    icon.classList.remove('rotate-180');
                    select.dispatchEvent(new Event('change'));
                    
                    if (window.sysAudio) {
                        window.sysAudio('click');
                    }
                    renderOptions();
                };
                list.appendChild(li);
            });
        };
        
        renderOptions();
        listWrapper.appendChild(list);
        
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isHidden = listWrapper.classList.contains('hidden');
            
            document.querySelectorAll('.custom-select-wrapper > div').forEach(div => div.classList.add('hidden'));
            document.querySelectorAll('.custom-select-wrapper i').forEach(i => i.classList.remove('rotate-180'));
            
            if (isHidden) {
                renderOptions();
                listWrapper.classList.remove('hidden');
                icon.classList.add('rotate-180');
            }
        };
        
        wrapper.appendChild(btn);
        wrapper.appendChild(listWrapper);
        
        select.parentNode.insertBefore(wrapper, select.nextSibling);
        
        select.addEventListener('change', () => {
            label.textContent = select.options[select.selectedIndex]?.text || '';
            renderOptions();
        });
    });
};

document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
        document.querySelectorAll('.custom-select-wrapper > div').forEach(div => div.classList.add('hidden'));
        document.querySelectorAll('.custom-select-wrapper i').forEach(i => i.classList.remove('rotate-180'));
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if(window.initCustomSelects) {
        window.initCustomSelects();
    }
});
