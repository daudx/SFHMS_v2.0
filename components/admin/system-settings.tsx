"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export function SystemSettings() {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form
    const [category, setCategory] = useState("Fitness");
    const [name, setName] = useState("");
    const [value, setValue] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = () => {
        setLoading(true);
        fetch('/api/admin/system-settings')
            .then(res => res.json())
            .then(data => {
                if (data.success) setSettings(data.settings || []);
            })
            .finally(() => setLoading(false));
    };

    const handleCreate = async () => {
        if (!name || !value) return;
        const res = await fetch('/api/admin/system-settings', {
            method: 'POST',
            body: JSON.stringify({ category, name, value }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
            toast({ title: "Setting created" });
            setIsDialogOpen(false);
            setName(""); setValue("");
            fetchSettings();
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete setting?")) return;
        await fetch(`/api/admin/system-settings?id=${id}`, { method: 'DELETE' });
        fetchSettings();
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Add Setting</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Add System Setting</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Fitness">Fitness</SelectItem>
                                        <SelectItem value="Medical">Medical</SelectItem>
                                        <SelectItem value="System">System</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Exercise Type" />
                            </div>
                            <div className="space-y-2">
                                <Label>Value</Label>
                                <Input value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. Cardio" />
                            </div>
                            <Button onClick={handleCreate} className="w-full">Create</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {settings.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center">No settings found</TableCell></TableRow> :
                            settings.map((s: any) => (
                                <TableRow key={s.SETTINGID}>
                                    <TableCell>{s.CATEGORY}</TableCell>
                                    <TableCell>{s.NAME}</TableCell>
                                    <TableCell>{s.VALUE}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" onClick={() => handleDelete(s.SETTINGID)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
